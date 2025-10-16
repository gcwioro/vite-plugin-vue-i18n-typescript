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
import {createVirtualModuleCode, toConstsContent, toTypesContent} from "./generator";

/* ------------------------ helpers ------------------------ */

export function log(server: ViteDevServer | undefined, enabled: boolean | undefined, ...args: any[]) {
  if (!enabled) return;
  const prefix = "[vite-plugin-locale-json]";
  if (server) server.config.logger.info(prefix + " " + args.join(" "));
  else console.log(prefix, ...args);
}

/* ------------------------ plugin ------------------------ */

export default function unpluginVueI18nDtsGeneration(userOptions: VirtualKeysDtsOptions = {}): PluginOption {
  const {
    sourceId = '@unplug-i18n-types-locales',
    typesPath = 'src/i18n/i18n.types.gen.d.ts',
    constsPath = 'src/i18n/i18n.gen.ts',
    getLocaleFromPath = defaultGetLocaleFromPath,
    baseLocale = 'de',
    include = ["src/**/locales/*.json", "src/**/locales/*.vue.*.json", `src/**/*${baseLocale}.json`],

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
    transformJson,
    exportMessages = false

  } = userOptions || {};
  const VIRTUAL_ID = sourceId;
  const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

  const doMerge = merge === "deep" ? deepMerge : shallowMerge;

  let root = "";
  let serverRef: ViteDevServer | undefined;

  let groupedCache: Record<string, any> = {};
  let jsonTextCache = "{}";
  let lastFiles: string[] = [];

  let isBuild = false;
  let emittedRefId: string | undefined;

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
    const files = await collectJsonFiles();
    lastFiles = files;
    const grouped: Record<string, any> = {};

    for (const abs of files) {
      const localeKey = getLocaleFromPath(abs, root);
      if (!localeKey) {
        console.warn(`Skipping file with invalid locale: ${abs}`);
        continue;
      }
      console.warn(`${abs} -> ${localeKey}`);
      try {
        const raw = await fs.readFile(abs, "utf8");
        const parsed = JSON.parse(raw);
        const prepared = transformJson ? transformJson(parsed, abs) : parsed;
        if (!(localeKey in grouped)) grouped[localeKey] = {};
        grouped[localeKey] = doMerge(grouped[localeKey], prepared);
      } catch (err: any) {
        const message = `Failed to parse/merge JSON: ${abs}\n${err?.message ?? err}`;
        if (serverRef) serverRef.config.logger.error(message);
        else console.error(message);
        if (!serverRef) throw err;
      }
    }

    return grouped;
  }

  async function rebuild(reason: string) {
    groupedCache = await readAndGroup();
    jsonTextCache = JSON.stringify(canonicalize(groupedCache));
    log(serverRef, debug, `Rebuilt (${reason}). Locales: ${Object.keys(groupedCache).join(", ")}`, VIRTUAL_ID);

    // Generate TypeScript definition files
    if (typesPath && constsPath) {
      await generateFile(groupedCache, root);
    }

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
    log(serverRef, debug, `Checking file change: ${abs}|${file}`);
    return true;
  }

  function extractBase(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, languages: string[]) {
    return (value[baseLocale] ?? value?.[languages?.[0] ?? baseLocale] ?? {[baseLocale]: {}}) as JSONObject;
  }

  async function generateFileContent(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, rootDir: string) {
    // 2) Gather languages & select base locale
    const languages = Object.keys(value);

    const baseLanguagePart = extractBase(value, languages);
    const base = baseLanguagePart as JSONObject;
    if (!base || typeof base !== 'object' || Array.isArray(base)) {
      log(serverRef, debug,
        `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
      );
    }

    // Check for conflicting keys across locales
    const conflicts = detectKeyConflicts(value);
    if (conflicts.length > 0) {
      log(serverRef, debug, '⚠️  Conflicting translation keys detected:', {timestamp: true});
      for (const conflict of conflicts) {
        log(serverRef, debug, `   ${conflict}`, {timestamp: true});
      }
    }

    // 3) Deterministic inputs for DTS
    const sortedLanguages = Array.from(new Set(languages.filter(a => a != ' js-reserved'))).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const canonicalBase = canonicalize(value as JSONValue) as Record<string, JSONValue>;
    const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath);
    const constsOutPath = path.isAbsolute(constsPath) ? constsPath : path.join(rootDir, constsPath);

    const relativePathToTypes = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\.d\.ts$/, '');
    // 4) Generate dual files
    const typesContent = toTypesContent({
      messages: canonicalBase,
      baseLocale: baseLocale,
      supportedLanguages: sortedLanguages,
      banner,
    });

    const constsContent = toConstsContent({
      messages: canonicalBase,
      typeFilePath: './' + relativePathToTypes,
      baseLocale: baseLocale,
      supportedLanguages: sortedLanguages,
      banner,
      exportMessages,
      sourceId: sourceId
    });
    // Update import path in consts file to point to types file
    const relativePath = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\.d\.ts$/, '');
    const adjustedConstsContent = constsContent.replace(
      `from './i18n.types'`,
      `from './${relativePath}'`
    );
    return {constsContent: adjustedConstsContent, typesContent};
  }

  async function generateFile(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, rootDir: string) {
    const start = (globalThis.performance?.now?.() ?? Date.now());
    const languages = Object.keys(value);

    const base = extractBase(value, languages);
    if (!base || typeof base !== 'object' || Array.isArray(base)) {
      log(serverRef, debug,
        `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
      );
    }

    // Check for conflicting keys across locales
    const conflicts = detectKeyConflicts(value);
    if (conflicts.length > 0) {
      log(serverRef, debug, '⚠️  Conflicting translation keys detected:', {timestamp: true});
      for (const conflict of conflicts) {
        log(serverRef, debug, `   ${conflict}`, {timestamp: true});
      }
    }

    const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath);
    const constsOutPath = path.isAbsolute(constsPath) ? constsPath : path.join(rootDir, constsPath);

    const {
      constsContent: adjustedConstsContent,
      typesContent
    } = await generateFileContent(value, rootDir);

    // Write types file
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

    // Write consts file
    await ensureDir(constsOutPath);

    let shouldWriteConsts: boolean;
    try {
      const existing = await fs.readFile(constsOutPath, 'utf8');
      shouldWriteConsts = existing !== adjustedConstsContent;
    } catch {
      shouldWriteConsts = true;
    }

    if (shouldWriteConsts) {
      await writeFileAtomic(constsOutPath, adjustedConstsContent);
    }
    log(serverRef, debug,
      `Generated ${path.relative(rootDir, typesOutPath)} and ${path.relative(rootDir, constsOutPath)} in ${Math.round((globalThis.performance?.now?.() ?? Date.now()) - start)}ms`,
    );
    return {constsContent: adjustedConstsContent, typesContent};
  }


  return {
    name: "vite-plugin-locale-json",
    enforce: "pre",

    configResolved(cfg) {
      root = cfg.root;
      isBuild = cfg.command === "build";
    },

    async buildStart() {
      groupedCache = await readAndGroup();
      jsonTextCache = JSON.stringify(canonicalize(groupedCache));
      await generateFileContent(groupedCache, root);
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
          jsonText: jsonTextCache,
          exportData: !!emit.inlineDataInBuild,
          buildAssetRefId: emittedRefId,
        });
      }

      return createVirtualModuleCode({
        jsonText: jsonTextCache,
        exportData: true,
        devUrlPath: devUrlPath,
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
                    }: HotUpdateOptions): Promise<Array<EnvironmentModuleNode> | void> {//Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>{
      if (!isWatchedFile(ctx.file)) return;
      await rebuild("change");
      // const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      const mod = modules.filter(m => m.id === RESOLVED_VIRTUAL_ID);
      if (modules.length > 0 && mod.length === 0) {
        server.config.logger.info(`No module to hot update found for ${RESOLVED_VIRTUAL_ID}`);
        if (debug) {
          server.config.logger.info(`Known modules: ${[...server.moduleGraph.idToModuleMap.keys()].join(", ")}`);
        }
        return;
      }

      return mod ? mod : [];
    },
    // handleHotUpdate,
  };
}
