import path from "node:path";
import {promises as fs} from "node:fs";
import {EnvironmentModuleNode, HotUpdateOptions, Logger, normalizePath, PluginOption,} from "vite";
import type {VirtualKeysDtsOptions} from "./types";
import {createVirtualModuleCode} from "./generator";
import {normalizeConfig} from "./core/config";
import {FileManager} from "./core/file-manager";
import {GenerationCoordinator} from "./core/generation-coordinator";
import {RebuildManager} from "./core/rebuild-manager";

/**
 * Vite plugin for generating TypeScript definitions from Vue i18n locale files
 */
export function vitePluginVueI18nTypes(
  userOptions: VirtualKeysDtsOptions = {}
): PluginOption {
  // Normalize configuration
  const config = normalizeConfig(userOptions);

  // Plugin state
  let root = "";
  let logger: Logger;
  let isBuild = false;
  let emittedRefId: string | undefined;
  let groupedCache: Record<string, any> = {};
  let jsonTextCache = "{}";
  let lastFiles: string[] = [];

  // Core managers (initialized in configResolved)
  let fileManager: FileManager;
  let generationCoordinator: GenerationCoordinator;
  let rebuildManager: RebuildManager;

  /**
   * Check if types file exists and is accessible
   */
  async function checkTypesFileExists(): Promise<void> {
    const typesOutPath = path.isAbsolute(config.typesPath)
      ? config.typesPath
      : path.join(root, config.typesPath);

    try {
      await fs.access(typesOutPath, fs.constants.W_OK);
      logger.info(`Types file is accessible at: ${typesOutPath}`);
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn(
        `Types file does not exist at: ${typesOutPath}. Will be created during buildStart. ${err.message}`
      );
    }
  }

  /**
   * Check if a file change should trigger a rebuild
   */
  function isWatchedFile(file: string): boolean {
    const abs = normalizePath(file);

    if (!abs.endsWith(".json")) return false;

    // const rel = normalizePath(path.relative(root, abs));
    // if (rel.startsWith("..")) return false;

    if (config.debug) {
      logger.info(`Checking file change: ${abs}`);
    }

    return true;
  }

  return {
    name: "vite-plugin-locale-json",
    enforce: "pre",

    async configResolved(cfg) {
      root = cfg.root;
      isBuild = cfg.command === "build";
      logger = cfg.logger;

      logger.info(`🔧 [configResolved] Hook triggered. Root: ${root}, Command: ${cfg.command}, isBuild: ${isBuild}`);

      // Initialize core managers
      fileManager = new FileManager({
        include: config.include,
        exclude: config.exclude,
        root,
        getLocaleFromPath: config.getLocaleFromPath,
        transformJson: config.transformJson,
        merge: config.mergeFunction,
        logger,
        debug: config.debug,
      });

      generationCoordinator = new GenerationCoordinator({
        typesPath: config.typesPath,
        virtualFilePath: config.virtualFilePath,
        baseLocale: config.baseLocale,
        banner: config.banner,
        sourceId: config.sourceId,
        logger,
      });

      rebuildManager = new RebuildManager({
        fileManager,
        generationCoordinator,
        root,
        logger,
        onRebuildComplete: (cache) => {
          groupedCache = cache.grouped;
          jsonTextCache = cache.jsonText;
          lastFiles = fileManager.getLastFiles();
        },
      });

      await checkTypesFileExists();
    },

    async buildStart() {
      logger.info(`🚀 [buildStart] Hook triggered. isBuild: ${isBuild}`);

      // Perform initial rebuild
      const result = await rebuildManager.rebuild("buildStart", []);
      groupedCache = result.grouped;
      jsonTextCache = result.jsonText;

      logger.info(`📊 [buildStart] Initial rebuild complete. Locales: ${Object.keys(groupedCache).join(", ")}`);

      // Emit asset file in build mode if emitJson is enabled
      if (isBuild && config.emit.emitJson) {
        emittedRefId = this.emitFile({
          type: "asset",
          name: config.emit.fileName,
          source: jsonTextCache,
        });
        logger.info(`📦 [buildStart] Emitted asset: ${config.emit.fileName}, refId: ${emittedRefId}`);
      }
    },

    resolveId(id) {
      if (id.includes(config.sourceId)) {


        if (id === config.virtualJsonId) {
          logger.info(`🔍 [resolveId] Resolved virtual JSON module: ${id} -> ${config.resolvedVirtualJsonId}`);
          return config.resolvedVirtualJsonId;
        }

        if (id !== config.virtualId) {
          logger.warn(`🔍 [resolveId] Resolved undefined virtual module: ${id} -> ${config.resolvedVirtualId}`);
          return config.resolvedVirtualId;
        }
        return config.resolvedVirtualId;
      }
      return null;
    },

    load(id) {
      // Handle JSON virtual module
      if (id === config.resolvedVirtualJsonId) {
        logger.info(`📄 [load] Loading virtual JSON module: ${id}, data size: ${jsonTextCache.length} bytes`);
        // Return as a JavaScript module, not JSON to avoid vite:json plugin
        return {
          code: `export default ${jsonTextCache}`,
          map: null
        };
      }

      // Handle main virtual module
      if (id === config.resolvedVirtualId) {
        logger.info(`📄 [load] Loading virtual module: ${id}, isBuild: ${isBuild}`);
        if (isBuild) {
          // Reference the virtual JSON module instead of embedding or using assets
          const code = createVirtualModuleCode({
            jsonText: jsonTextCache,
            buildAssetRefId: config.emit.emitJson ? emittedRefId : undefined,
            baseLocale: config.baseLocale,
            virtualJsonId: config.virtualJsonId,
          });
          logger.info(`📄 [load] Generated build code for virtual module, size: ${code.length} bytes`);
          return code;
        }

        const code = createVirtualModuleCode({
          jsonText: jsonTextCache,
          devUrlPath: config.devUrlPath,
          baseLocale: config.baseLocale,
          virtualJsonId: config.virtualJsonId,
        });
        logger.info(`📄 [load] Generated dev code for virtual module, size: ${code.length} bytes`);
        return code;
      }

      return null;
    },

    configureServer(server) {
      logger.info(`🌐 [configureServer] Hook triggered. Setting up dev server...`);

      // Set server reference for hot updates (use virtualId for module graph lookups)
      rebuildManager.setServer(server, config.virtualId);
      logger.info(`🌐 [configureServer] Server reference set for virtual module: ${config.virtualId}`);

      const resolvePattern = (pattern: string): string | undefined => {
        if (!pattern) return undefined;
        const isNegated = pattern.startsWith("!");
        const rawPattern = isNegated ? pattern.slice(1) : pattern;
        const trimmedPattern = rawPattern.startsWith("./") ? rawPattern.slice(2) : rawPattern;
        const absolutePattern = path.isAbsolute(rawPattern)
          ? rawPattern
          : path.join(root, trimmedPattern);
        const normalized = normalizePath(absolutePattern);
        return isNegated ? `!${normalized}` : normalized;
      };

      const includePatterns = config.include
        .map(resolvePattern)
        .filter((pattern): pattern is string => Boolean(pattern));
      const excludePatterns = config.exclude
        .map((pattern) => {
          const resolved = resolvePattern(pattern);
          if (!resolved) return undefined;
          return resolved.startsWith("!") ? resolved : `!${resolved}`;
        })
        .filter((pattern): pattern is string => Boolean(pattern));

      const watcherPatterns = [...includePatterns, ...excludePatterns];

      if (watcherPatterns.length > 0) {
        server.watcher.add(watcherPatterns);
        if (config.debug) {
          logger.info(
            `🌐 [configureServer] Registered watcher patterns: ${watcherPatterns.join(", ")}`
          );
        }
      }

      // Initial rebuild
      logger.info(`🌐 [configureServer] Triggering initial rebuild...`);
      rebuildManager.rebuild("initial", []).catch((e) => {
        server.config.logger.error(`Initial rebuild failed: ${String(e)}`);
      });

      // Serve locales JSON endpoint
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        if (req.url === config.devUrlPath) {
          logger.info(`🔗 [middleware] Serving JSON endpoint: ${req.url}, size: ${jsonTextCache.length} bytes`);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(jsonTextCache);
          return;
        }
        next();
      });

      // Debug endpoint
      if (config.debug) {
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

    async hotUpdate({server, timestamp, type, modules, ...ctx}: HotUpdateOptions): Promise<
      Array<EnvironmentModuleNode> | void
    > {
      logger.info(`🔥 [hotUpdate] Hook triggered for file: ${ctx.file}, type: ${type}, timestamp: ${timestamp}`);
      logger.info(`🔥 [hotUpdate] Environment: ${this.environment?.name}, modules count: ${modules.length}`);

      if (!isWatchedFile(ctx.file)) {
        logger.info(`🔥 [hotUpdate] File not watched, skipping: ${ctx.file}`);
        return;
      }

      if (config.debug) {
        logger.info(`🔥 [hotUpdate] Debug: Module details for ${type}:`);
        modules.forEach((m, i) => {
          logger.info(`  Module ${i}: id=${m.id}, url=${m.url}, type=${m.type}`);
        });
      }

      // Only process in client environment to avoid duplicate rebuilds
      if (this.environment?.name !== 'client') {
        logger.info(`🔥 [hotUpdate] Skipping for non-client environment: ${this.environment?.name}`);
        return;
      }

      logger.info(`🔥 [hotUpdate] Triggering rebuild for file change...`);
      await rebuildManager.setEnv(this.environment);

      // Perform rebuild immediately (no debouncing needed in Vite 7)
      const result = await rebuildManager.rebuild("change", modules);

      // Send custom HMR event to update i18n messages directly
      logger.info(`🔥 [hotUpdate] Sending custom i18n-update event with new messages`);

      // Send the updated messages to the client
      server.ws.send({
        type: 'custom',
        event: 'i18n-update',
        data: {
          messages: result.grouped,
          timestamp
        }
      });

      // Return empty array to prevent default HMR behavior
      return [];
    },
  };
}

export default vitePluginVueI18nTypes;
