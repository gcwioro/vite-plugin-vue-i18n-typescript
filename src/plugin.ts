import path from "node:path";
import {promises as fs} from "node:fs";
import {
  EnvironmentModuleNode,
  HotUpdateOptions,
  normalizePath,
  PluginOption,
  ViteDevServer
} from "vite";
// NOTE: fast-glob is no longer eagerly imported.
// It will be lazy-loaded ONLY as a fallback on older Node versions.
import {
  canonicalize,
  deepMerge,
  defaultGetLocaleFromPath,
  detectKeyConflicts,
  ensureDir,
  shallowMerge,
  toArray,
  writeFileAtomic
} from "./utils";
import type {JSONObject, JSONValue, VirtualKeysDtsOptions} from "./types";
import {
  createVirtualModuleCode,
  toTypesContent,
  toVirtualModuleContent
} from "./generator";


/* ------------------------ plugin ------------------------ */

export default function unpluginVueI18nDtsGeneration(userOptions: VirtualKeysDtsOptions = {}): PluginOption {
  const {
    sourceId = 'virtual:unplug-i18n-dts-generation',
    typesPath = './vite-env-override.d.ts',
    virtualFilePath,
    getLocaleFromPath = defaultGetLocaleFromPath,
    baseLocale = 'de',
    include = ["src/**/locales/*.json", "src/**/*.vue.*.json", `src/**/*${baseLocale}.json`],
    exclude = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/.next/**',
      '**/build/**',
    ],
    merge = 'deep',
    banner,
    debug = false,
    devUrlPath = "/_virtual_locales.json",
    emit =
      {
        fileName: (userOptions || {}).emit?.fileName ?? "assets/locales.json",
        inlineDataInBuild: (userOptions || {}).emit?.inlineDataInBuild ?? true,
      },
    transformJson
  } = userOptions || {};
  const VIRTUAL_ID = sourceId;
  const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

  const doMerge = merge === "deep" ? deepMerge : shallowMerge;

  let root = "";
  let serverRef: ViteDevServer | undefined;

  let groupedCache: Record<string, any> = {};
  let jsonTextCache = "{}";
  let lastFiles: string[] = [];

  // Track file modification times for incremental updates
  const fileModTimes = new Map<string, number>();
  const parsedFilesCache = new Map<string, any>();

  let isBuild = false;
  let emittedRefId: string | undefined;

  // Debounced rebuild to prevent rebuild storms during rapid file changes
  let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
  let lastRebuildCall = 0;
  const DEBOUNCE_MS = 300;
  const MAX_WAIT_MS = 2000;

  const debouncedRebuild = (reason: string) => {
    const now = Date.now();
    if (!lastRebuildCall) lastRebuildCall = now;

    if (rebuildTimer) clearTimeout(rebuildTimer);

    // If we've been waiting too long, rebuild immediately
    if (now - lastRebuildCall >= MAX_WAIT_MS) {
      lastRebuildCall = 0;
      return rebuild(reason);
    }

    // Otherwise, schedule a debounced rebuild
    return new Promise<void>((resolve) => {
      rebuildTimer = setTimeout(async () => {
        lastRebuildCall = 0;
        await rebuild(reason);
        resolve();
      }, DEBOUNCE_MS);
    });
  };

  /**
   * Prefer Node's native glob (Node >= 22).
   * Fallback to fast-glob only when native glob isn't available.
   */
  async function collectJsonFiles(): Promise<string[]> {
    const patterns = toArray(include);
    const ignore = toArray(exclude);
    const entries = new Set<string>();
    const cwd = root;

    // Node 22+: fs.promises.glob exists
    const fsAny = fs as unknown as {
      glob?: (pattern: string | readonly string[], options?: any) => AsyncIterable<string>;
    };

    if (typeof fsAny.glob === "function") {
      // Use native glob; iterate patterns to avoid relying on array support differences.
      for (const pattern of patterns) {
        // Pass cwd and exclude. Native glob yields paths relative to cwd by default.
        for await (const rel of fsAny.glob(pattern, {cwd, exclude: ignore})) {
          const abs = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
          entries.add(path.normalize(abs));
        }
      }
    } else {
      // Fallback: fast-glob (lazy-loaded so projects on Node 22+ don't need it installed)
      const {default: fg} = await import("fast-glob");
      const list: string[] = await fg(patterns, {
        cwd,
        ignore,
        absolute: true,
        onlyFiles: true,
        dot: false
      });
      for (const p of list) entries.add(path.normalize(p));
    }

    const out = Array.from(entries);
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }

  async function readAndGroup(): Promise<Record<string, any>> {
    const startReadGroup = performance.now();
    const files = await collectJsonFiles();
    lastFiles = files;
    const grouped: Record<string, any> = {};

    // Check which files need to be re-read (new or modified)
    const filesToRead: string[] = [];
    const startStatCheck = performance.now();
    const fileStats = await Promise.all(
      files.map(async (f) => {
        try {
          const stat = await fs.stat(f);
          return {path: f, mtime: stat.mtimeMs};
        } catch {
          return {path: f, mtime: 0};
        }
      })
    );
    const statCheckDuration = Math.round(performance.now() - startStatCheck);

    for (const {path: abs, mtime} of fileStats) {
      const cachedMtime = fileModTimes.get(abs);
      if (cachedMtime === undefined || mtime !== cachedMtime) {
        filesToRead.push(abs);
        fileModTimes.set(abs, mtime);
      }
    }

    // Remove entries for files that no longer exist
    const currentFiles = new Set(files);
    for (const [cachedPath] of fileModTimes) {
      if (!currentFiles.has(cachedPath)) {
        fileModTimes.delete(cachedPath);
        parsedFilesCache.delete(cachedPath);
      }
    }

    // Read only changed/new files
    const startFileRead = performance.now();
    for (const abs of filesToRead) {
      const localeKey = getLocaleFromPath(abs, root);
      if (!localeKey) {
        serverRef?.config.logger.warn(`Skipping file with invalid locale: ${abs}`);
        continue;
      }
      if (localeKey.length !== 2 && localeKey.length !== 5) {
        serverRef?.config.logger.warn(`Uncommon locale: ${abs} -> ${localeKey}`);
      }
      try {
        const raw = await fs.readFile(abs, "utf8");
        const parsed = JSON.parse(raw);
        const prepared = transformJson ? transformJson(parsed, abs) : parsed;
        parsedFilesCache.set(abs, {localeKey, prepared});
      } catch (err: any) {
        const message = `Failed to parse/merge JSON: ${abs}\n${err?.message ?? err}`;
        if (serverRef) serverRef.config.logger.error(message);
        else console.error(message);
        if (!serverRef) throw err;
      }
    }
    const fileReadDuration = Math.round(performance.now() - startFileRead);

    // Merge all cached files (including unchanged ones)
    const startMerge = performance.now();
    for (const [_, {localeKey, prepared}] of parsedFilesCache) {
      if (!(localeKey in grouped)) grouped[localeKey] = {};
      grouped[localeKey] = doMerge(grouped[localeKey], prepared);
    }
    const mergeDuration = Math.round(performance.now() - startMerge);

    const totalDuration = Math.round(performance.now() - startReadGroup);
    if (debug || filesToRead.length > 0) {
      serverRef?.config.logger.info(
        `📖 Read & Group: ${totalDuration}ms (stat: ${statCheckDuration}ms, read ${filesToRead.length}/${files.length} files: ${fileReadDuration}ms, merge: ${mergeDuration}ms)`
      );
    }

    return grouped;
  }

  async function rebuild(reason: string) {
    const startRebuild = performance.now();

    const rawGrouped = await readAndGroup();

    // Canonicalize once and cache it to avoid repeated canonicalization
    const startCanonical = performance.now();
    groupedCache = canonicalize(rawGrouped as JSONValue) as Record<string, any>;
    jsonTextCache = JSON.stringify(groupedCache);
    const canonicalDuration = Math.round(performance.now() - startCanonical);

    // Generate TypeScript definition files
    if (typesPath) {
      await generateFile(groupedCache, root);
    }

    const totalRebuildDuration = Math.round(performance.now() - startRebuild);
    serverRef?.config.logger.info(
      `✅ Rebuild complete (${reason}) in ${totalRebuildDuration}ms (canonicalize: ${canonicalDuration}ms) | VirtualId: ${VIRTUAL_ID} | Locales: ${Object.keys(groupedCache).join(", ")}`
    );

    if (serverRef) {
      const mod = serverRef.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      if (mod) {
        await serverRef.moduleGraph.invalidateModule(mod);
        serverRef.ws.send({
          type: "full-reload",
          path: "*"
        });
      }
    }
  }

  function isWatchedFile(file: string): boolean {
    const abs = normalizePath(file);

    if (!abs.endsWith(".json")) return false;
    const rel = normalizePath(path.relative(root, abs));
    if (rel.startsWith("..")) return false;
    serverRef?.config.logger.info(`Checking file change: ${abs}|${file}`);
    return true;
  }

  function extractBase(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, languages: string[]) {
    return (value[baseLocale] ?? value?.[languages?.[0] ?? baseLocale] ?? {[baseLocale]: {}}) as JSONObject;
  }

  async function generateFileContent(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>) {
    // Note: value is already canonicalized from rebuild/buildStart
    const languages = Object.keys(value);

    const baseLanguagePart = extractBase(value, languages);
    const base = baseLanguagePart as JSONObject;
    if (!base || typeof base !== 'object' || Array.isArray(base)) {
      serverRef?.config.logger.warn(
        `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
      );
    }

    // Check for conflicting keys across locales
    const conflicts = detectKeyConflicts(value);
    if (conflicts.length > 0) {
      serverRef?.config.logger.warn('⚠️  Conflicting translation keys detected:', {timestamp: true});
      for (const conflict of conflicts) {
        serverRef?.config.logger.warn(`   ${conflict}`, {timestamp: true});
      }
    }

    // Deterministic inputs for DTS
    const sortedLanguages = Array.from(new Set(languages.filter(a => a != ' js-reserved'))).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    // Data is already canonical, no need to canonicalize again
    const canonicalBase = value as Record<string, JSONObject>;

    const typesContent = toTypesContent({
      messages: canonicalBase,
      baseLocale: baseLocale,
      supportedLanguages: sortedLanguages,
      banner,
      sourceId
    });

    return typesContent;
  }

  async function generateFile(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, rootDir: string) {
    const start = performance.now();

    // Generate content (includes all validation and conflict detection)
    const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath);
    const virtualOutPath = virtualFilePath ? (path.isAbsolute(virtualFilePath) ? virtualFilePath : path.join(rootDir, virtualFilePath)) : undefined;

    const startContentGen = performance.now();
    const typesContent = await generateFileContent(value);

    // Generate virtual module content if path is specified
    const virtualContent = virtualOutPath ? toVirtualModuleContent({
      messages: value as Record<string, JSONObject>,
      baseLocale,
      banner,
      sourceId
    }) : undefined;

    const contentGenDuration = Math.round(performance.now() - startContentGen);

    // Write types file
    const startWrite = performance.now();
    await ensureDir(typesOutPath);

    let shouldWriteTypes: boolean;
    try {
      const existing = await fs.readFile(typesOutPath, 'utf8');
      shouldWriteTypes = existing !== typesContent;
    } catch {
      shouldWriteTypes = true;
    }

    if (shouldWriteTypes) {
      await writeFileAtomic(typesOutPath, typesContent);
    }

    // Write virtual module file if specified
    let shouldWriteVirtual = false;
    if (virtualOutPath && virtualContent) {
      await ensureDir(virtualOutPath);
      try {
        const existing = await fs.readFile(virtualOutPath, 'utf8');
        shouldWriteVirtual = existing !== virtualContent;
      } catch {
        shouldWriteVirtual = true;
      }

      if (shouldWriteVirtual) {
        await writeFileAtomic(virtualOutPath, virtualContent);
      }
    }
    const writeDuration = Math.round(performance.now() - startWrite);

    const totalDuration = Math.round(performance.now() - start);
    const totalFiles = virtualOutPath ? 2 : 1;
    const filesWritten = (shouldWriteTypes ? 1 : 0) + (shouldWriteVirtual ? 1 : 0);

    const filesList = [path.relative(rootDir, typesOutPath)];
    if (virtualOutPath) {
      filesList.push(path.relative(rootDir, virtualOutPath));
    }

    serverRef?.config.logger.info(
      `📝 Generated files in ${totalDuration}ms (content: ${contentGenDuration}ms, write ${filesWritten}/${totalFiles} files: ${writeDuration}ms) | ${filesList.join(', ')}`,
    );
    return typesContent;
  }


  return {
    name: "vite-plugin-locale-json",
    enforce: "pre",

    configResolved(cfg) {
      root = cfg.root;
      isBuild = cfg.command === "build";
    },

    async buildStart() {
      const rawGrouped = await readAndGroup();
      // Canonicalize once and cache it to avoid repeated canonicalization
      groupedCache = canonicalize(rawGrouped as JSONValue) as Record<string, any>;
      jsonTextCache = JSON.stringify(groupedCache);
      if (isBuild) {
        emittedRefId = this.emitFile({
          type: "asset",
          name: emit.fileName,
          source: jsonTextCache,
        });
        await generateFile(groupedCache, root);
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      if (isBuild) {
        return createVirtualModuleCode({
          sourceId,
          jsonText: jsonTextCache,
          exportData: true,
          buildAssetRefId: emittedRefId,
          baseLocale
        });
      }

      return createVirtualModuleCode({
        sourceId,
        jsonText: jsonTextCache,
        exportData: true,
        devUrlPath: devUrlPath,
        baseLocale,
      });
    },

    configureServer(server) {
      serverRef = server;

      // Initial build + middleware
      rebuild("initial").catch((e) => server.config.logger.error(String(e)));

      const servePath = devUrlPath;
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        if (req.url === servePath) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(jsonTextCache);
          return;
        }
        next();
      });

      if (debug) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/__locales_debug__") {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({files: lastFiles, grouped: groupedCache}, null, 2));
            return;
          }
          next();
        });
      }
    },
    async hotUpdate({
                      server,
                      modules,
                      ...ctx
                    }: HotUpdateOptions): Promise<Array<EnvironmentModuleNode> | void> {
      if (!isWatchedFile(ctx.file)) return;
      await debouncedRebuild("change");
      const mod = modules.filter(m => m.id === RESOLVED_VIRTUAL_ID);
      if (modules.length > 0 && mod.length === 0) {
        server.config.logger.info(`No module to hot update found for ${RESOLVED_VIRTUAL_ID}`);
        if (debug) {
          server.config.logger.info(`Known modules: ${[...server.moduleGraph.idToModuleMap.keys()].join(", ")}`);
        }
        return;
      }

      return mod ? mod : [];
    }
  };
}
