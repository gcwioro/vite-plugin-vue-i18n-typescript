import path from "node:path";
import {promises as fs} from "node:fs";
import {
  EnvironmentModuleNode,
  HotUpdateOptions,
  Logger,
  normalizePath,
  PluginOption,
} from "vite";
import type {VirtualKeysDtsOptions} from "./types";
import {createVirtualModuleCode} from "./generator";
import {normalizeConfig} from "./core/config";
import {FileManager} from "./core/file-manager";
import {GenerationCoordinator} from "./core/generation-coordinator";
import {RebuildManager} from "./core/rebuild-manager";

/**
 * Vite plugin for generating TypeScript definitions from Vue i18n locale files
 */
export default function unpluginVueI18nDtsGeneration(
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

    const rel = normalizePath(path.relative(root, abs));
    if (rel.startsWith("..")) return false;

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

      logger.info(`Config resolved. Root: ${root}, isBuild: ${isBuild}`);

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
      // Perform initial rebuild
      const result = await rebuildManager.rebuild("buildStart");
      groupedCache = result.grouped;
      jsonTextCache = result.jsonText;

      // Emit asset file in build mode if emitJson is enabled
      if (isBuild && config.emit.emitJson) {
        emittedRefId = this.emitFile({
          type: "asset",
          name: config.emit.fileName,
          source: jsonTextCache,
        });
      }
    },

    resolveId(id) {
      if (id === config.virtualId) return config.resolvedVirtualId;
      if (id === config.virtualJsonId) return config.resolvedVirtualJsonId;
      return null;
    },

    load(id) {
      // Handle JSON virtual module
      if (id === config.resolvedVirtualJsonId) {
        // Return as a JavaScript module, not JSON to avoid vite:json plugin
        return {
          code: `export default ${jsonTextCache}`,
          map: null
        };
      }

      // Handle main virtual module
      if (id === config.resolvedVirtualId) {
        if (isBuild) {
          // Reference the virtual JSON module instead of embedding or using assets
          return createVirtualModuleCode({
            jsonText: jsonTextCache,
            buildAssetRefId: config.emit.emitJson ? emittedRefId : undefined,
            baseLocale: config.baseLocale,
            virtualJsonId: config.virtualJsonId,
          });
        }

        return createVirtualModuleCode({
          jsonText: jsonTextCache,
          devUrlPath: config.devUrlPath,
          baseLocale: config.baseLocale,
          virtualJsonId: config.virtualJsonId,
        });
      }

      return null;
    },

    configureServer(server) {
      // Set server reference for hot updates
      rebuildManager.setServer(server, config.resolvedVirtualId);

      // Initial rebuild
      rebuildManager.rebuild("initial").catch((e) => {
        server.config.logger.error(`Initial rebuild failed: ${String(e)}`);
      });

      // Serve locales JSON endpoint
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        if (req.url === config.devUrlPath) {
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

    async hotUpdate({server, modules, ...ctx}: HotUpdateOptions): Promise<
      Array<EnvironmentModuleNode> | void
    > {
      if (!isWatchedFile(ctx.file)) return;

      await rebuildManager.debouncedRebuild("change");

      const mod = modules.filter((m) => m.id === config.resolvedVirtualId);
      if (modules.length > 0 && mod.length === 0) {
        server.config.logger.info(`No module to hot update found for ${config.resolvedVirtualId}`);
        if (config.debug) {
          server.config.logger.info(
            `Known modules: ${[...server.moduleGraph.idToModuleMap.keys()].join(", ")}`
          );
        }
        return;
      }

      return mod.length > 0 ? mod : [];
    },
  };
}
