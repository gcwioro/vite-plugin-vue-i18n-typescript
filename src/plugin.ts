import path from "node:path";
import {promises as fs} from "node:fs";
import {EnvironmentModuleNode, HotUpdateOptions, Logger, normalizePath, PluginOption,} from "vite";
import type {VirtualKeysDtsOptions} from "./types";
import {createVirtualModuleCode} from "./generation/generator";
import {normalizeConfig} from "./core/config";
import {FileManager} from "./core/file-manager";
import {GenerationCoordinator} from "./core/generation-coordinator";
import {RebuildManager} from "./core/rebuild-manager";
import {CombinedMessages} from "./core/combined-messages";

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
  let logger: Logger = console as unknown as Logger;
  let infoLogger: (message: string) => void = () => {
  };
  let isBuild = false;
  let emittedRefId: string | undefined;
  let combinedMessages = new CombinedMessages({[config.baseLocale]: {}}, config.baseLocale);
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
      infoLogger(`Types file is accessible at: ${typesOutPath}`);
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
      infoLogger(`Checking file change: ${abs}`);
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
      infoLogger = config.debug
        ? (message: string) => {
          logger.info(message);
        }
        : () => {
        };

      infoLogger(`🔧 [configResolved] Hook triggered. Root: ${root}, Command: ${cfg.command}, isBuild: ${isBuild}`);

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
        ...config,
        logger,
      });

      rebuildManager = new RebuildManager({
        fileManager,
        generationCoordinator,
        root,
        logger,
        config: {...config, logger},
        onRebuildComplete: (cache) => {

          combinedMessages = cache.messages;
          lastFiles = fileManager.getLastFiles();
        },
      });

      await checkTypesFileExists();
    },

    async buildStart() {
      infoLogger(`🚀 [buildStart] Hook triggered. isBuild: ${isBuild}`);

      // Perform initial rebuild
      const result = await rebuildManager.rebuild("buildStart", []);

      combinedMessages = result.messages;

      infoLogger(`📊 [buildStart] Initial rebuild complete. Locales: ${combinedMessages
        .languages.join(", ")}`);

      // Emit asset file in build mode if emitJson is enabled
      if (isBuild && config.emit.emitJson) {
        emittedRefId = this.emitFile({
          type: "asset",
          name: config.emit.fileName,
          source: combinedMessages.messagesJsonString,
        });
        infoLogger(`📦 [buildStart] Emitted asset: ${config.emit.fileName}, refId: ${emittedRefId}`);
      }
    },

    resolveId(idResolve) {
      const id = idResolve.replaceAll(/\?\?.*/g, '');
      if (id.includes(config.sourceId)) {


        if (id === config.virtualJsonId) {
          infoLogger(`🔍 [resolveId] Resolved virtual JSON module: ${id} -> ${config.resolvedVirtualJsonId}`);
          return config.resolvedVirtualJsonId;
        }

        // Handle sub-modules like /availableLocales, /fallbackLocales
        if (id !== config.virtualId && id.startsWith(config.sourceId + '/')) {
          const resolvedId = '\0' + id;
          infoLogger(`🔍 [resolveId] Resolved sub-module: ${id} -> ${resolvedId}`);
          return resolvedId;
        }
        infoLogger(`🔍 [resolveId] Resolved module: ${id} -> ${config.resolvedVirtualId}`);
        return config.resolvedVirtualId;
      }
      if (config.debug) {
        // infoLogger(`📄 [resolveId] Skipping non-virtual module resolve: ${id}`);
      }
      return null;
    },

    load(idLoad) {
      const id = idLoad.replaceAll(/\?\?.*/g, '');
      if (id.includes(config.sourceId)) {
        // Handle JSON virtual module
        if (id === config.resolvedVirtualJsonId) {
          infoLogger(`📄 [load] Loading virtual JSON module: ${id}, data size: ${combinedMessages.keys.length} bytes`);
          // Return as a JavaScript module, not JSON to avoid vite:json plugin
          return {
            code: `
            export default ${combinedMessages.messagesJsonString}
            // export const availableLocales = ${combinedMessages.languagesTuple()}
            // export const fallbackLocales = ${JSON.stringify(combinedMessages.fallbackLocales)}

            `,
            map: null
          };
        }
        const code = createVirtualModuleCode({
          config: {...config, logger},
          buildAssetRefId: config.emit.emitJson ? emittedRefId : undefined,
        }, combinedMessages);
        infoLogger(`📄 [load] Generated dev code for virtual module: ${id}`);

        if (id === config.resolvedVirtualId) {
          infoLogger(`📄 [load] Loading virtual module: ${id}, isBuild: ${isBuild}`);
          return code.toFileContent()
        } else {
          // Handle sub-modules - extract the part after the sourceId
          // id is like "\0virtual:vue-i18n-types/availableLocales"
          const cleanId = id.replace('\0', '');
          const method = cleanId.replace(config.sourceId + '/', '').trim();
          infoLogger(`📄 [load (Sub-module)] Loading virtual sub-module: ${cleanId}, method: ${method}, isBuild: ${isBuild}`);
          const methodCode = code.getFileContentFor(method);
          infoLogger(`📄 [load (Sub-module)] Generated code for method: ${method}`);
          return methodCode;

        }
      }

      if (config.debug) {
        // logger.info(`📄 [load] Skipping non-virtual module load: ${id}`);
      }

      return null;
    }
    ,

    configureServer(server) {
      infoLogger(`🌐 [configureServer] Hook triggered. Setting up dev server...`);

      // Set server reference for hot updates (use virtualId for module graph lookups)
      rebuildManager.setServer(server, config.virtualId);
      infoLogger(`🌐 [configureServer] Server reference set for virtual module: ${config.virtualId}`);

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
          infoLogger(
            `🌐 [configureServer] Registered watcher patterns: ${watcherPatterns.join(", ")}`
          );
        }
      }

      // Initial rebuild
      infoLogger(`🌐 [configureServer] Triggering initial rebuild...`);
      rebuildManager.rebuild("initial", []).catch((e) => {
        server.config.logger.error(`Initial rebuild failed: ${String(e)}`);
      });

      // Serve locales JSON endpoint
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        if (req.url === config.devUrlPath) {
          infoLogger(`🔗 [middleware] Serving JSON endpoint: ${req.url}, size: ${combinedMessages.keys.length} bytes`);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(combinedMessages);
          return;
        }
        next();
      });

      // Debug endpoint
      if (config.debug) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/__locales_debug__") {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              files: lastFiles,
              grouped: combinedMessages.messages,
              base: combinedMessages.baseLocale
            }, null, 2));
            return;
          }
          next();
        });
      }
    }
    ,

    async hotUpdate(hotUpdateOptions
                    :
                    HotUpdateOptions
    ):
      Promise<
        Array<EnvironmentModuleNode> | void
      > {
      const {server, timestamp, type, modules, ...ctx} = hotUpdateOptions


      if (!isWatchedFile(ctx.file)) {
        // infoLogger(`🔥 [hotUpdate] File not watched, skipping: ${ctx.file} for ${modules}`);
        return;
      }
      infoLogger(`🔥 [hotUpdate] Hook triggered for file: ${ctx.file}, type: ${type}, timestamp: ${timestamp}`)

      infoLogger(`🔥 [hotUpdate] Environment: ${this.environment?.name}, modules count: ${modules.length}`);


      if (config.debug) {
        infoLogger(`🔥 [hotUpdate] Debug: Module details for ${type}:`);
        modules.forEach((m, i) => {
          infoLogger(`  Module ${i}: id=${m.id}, url=${m.url}, type=${m.type}`);
        });
      }

      // Only process in client environment to avoid duplicate rebuilds
      if (this.environment?.name !== 'client') {
        infoLogger(`🔥 [hotUpdate] Skipping for non-client environment: ${this.environment?.name}`);
        return;
      }

      infoLogger(`🔥 [hotUpdate] Triggering rebuild for file change...`);
      await rebuildManager.setEnv(this.environment);

      // Perform rebuild immediately (no debouncing needed in Vite 7)
      const result = await rebuildManager.rebuild("change", modules);

      // Send custom HMR event to update i18n messages directly
      infoLogger(`🔥 [hotUpdate] Sending custom i18n-update event with new messages`);

      // Send the updated messages to the client
      server.ws.send({
        type: 'custom',
        event: 'i18n-update',
        data: {
          messages: result.messages,
          timestamp
        }
      });

      // Return empty array to prevent default HMR behavior
      return [];
    },
  };
}

export default vitePluginVueI18nTypes;
