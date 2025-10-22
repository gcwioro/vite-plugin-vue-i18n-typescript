import path from "node:path";
import {promises as fs} from "node:fs";
import {
  createLogger,
  EnvironmentModuleNode,
  HotUpdateOptions,
  normalizePath,
  PluginOption,
  ViteDevServer,
} from "vite";
import type {VirtualKeysDtsOptions} from "./types";
import {createVirtualModuleCode} from "./generation/generator";
import {normalizeConfig, GenerationOptions, Consts} from "./core/config";
import {FileManager} from "./core/file-manager";
import {GenerationCoordinator} from "./core/generation-coordinator";
import {RebuildManager} from "./core/rebuild-manager";
import {CombinedMessages} from "./core/combined-messages";
import {createColoredLogger} from "./createConsoleLogger";
import pc from "picocolors";

/**
 * Vite plugin for generating TypeScript definitions from Vue i18n locale files
 */
export function vitePluginVueI18nTypes(
  userOptions: VirtualKeysDtsOptions = {}
): PluginOption {
  // Normalize configuration


  // Plugin state
  let root = "";
  let pluginLogger = createColoredLogger(userOptions.debug ? 'debug' : 'info', {customLogger: createLogger(userOptions.debug ? 'info' : 'warn')});

  let config: GenerationOptions = normalizeConfig(userOptions, pluginLogger);

  let isBuild = false;
  let emittedRefId: string | undefined;
  let combinedMessages: CombinedMessages = new CombinedMessages({['en-US']: {}}, 'en-US');
  let lastFiles: string[] = [];

  // Core managers (initialized in configResolved)
  let fileManager: FileManager;
  let generationCoordinator: GenerationCoordinator;
  let rebuildManager: RebuildManager;
  let server: ViteDevServer;

  /**
   * Check if types file exists and is accessible
   */
  async function checkTypesFileExists(): Promise<void> {
    const typesOutPath = path.isAbsolute(config.typesPath)
      ? config.typesPath
      : path.join(root, config.typesPath);

    try {
      await fs.access(typesOutPath, fs.constants.W_OK);
      pluginLogger.info(`Types file is accessible at: ${typesOutPath}`);
    } catch (e: unknown) {
      const err = e as Error;
      pluginLogger.warn(
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


    pluginLogger.debug(`Checking file change: ${abs}`);


    return true;
  }


  return {
    name: "vite-plugin-locale-json",
    enforce: "pre",

    async configResolved(cfg) {
      config = normalizeConfig(userOptions, pluginLogger, cfg);
      root = cfg.root;
      isBuild = cfg.command === "build";
      // logger = cfg.logger;
      pluginLogger = createColoredLogger(config.debug ? "debug" : cfg.logLevel, {customLogger: cfg.logger});

      pluginLogger.info(`🔧 [configResolved] Hook triggered. Root: ${root}, Command: ${cfg.command}, isBuild: ${isBuild}`);

      // Initialize core managers
      fileManager = new FileManager({
        include: config.include,
        exclude: config.exclude,
        root,
        getLocaleFromPath: config.getLocaleFromPath,
        transformJson: config.transformJson,
        merge: config.mergeFunction,
        logger: pluginLogger,
        debug: config.debug,
      });

      generationCoordinator = new GenerationCoordinator({
        ...config,
        logger: pluginLogger,
      });

      rebuildManager = new RebuildManager({
        fileManager,
        generationCoordinator,
        root,
        logger: pluginLogger,
        config: {...config, logger: pluginLogger},
        onRebuildComplete: (cache) => {

          combinedMessages = cache.messages;
          lastFiles = fileManager.getLastFiles();
        },
      });

      await checkTypesFileExists();
    },

    async buildStart() {
      pluginLogger.info(`🚀 [buildStart] Hook triggered. isBuild: ${isBuild}`);

      // Perform initial rebuild
      const result = await rebuildManager.rebuild("buildStart", []);

      combinedMessages = result.messages;

      pluginLogger.info(`📊 [buildStart] Initial rebuild complete. Locales: ${combinedMessages
        .languages.join(", ")}`);

      // Emit asset file in build mode if emitJson is enabled
      if (isBuild && !config.emit.inlineDataInBuild && config.emit.emitJson) {
        emittedRefId = this.emitFile({
          type: "asset",
          name: config.emit.fileName,
          source: combinedMessages.messagesJsonString,
        });
        pluginLogger.info(`📦 [buildStart] Emitted asset: ${config.emit.fileName}, refId: ${pc.yellow(emittedRefId)}`);
      }

      if (!isBuild) {
        const url = `http://localhost:${server.config.server.port}`;
        pluginLogger.info(`🌐 [buildStart] Debug endpoint enabled at ${pc.yellow(url + Consts.debugUrlPath)}`);
        pluginLogger.info(`🌐 [buildStart] Debug endpoint enabled at ${pc.yellow(url + Consts.devUrlPath)}`);

      }
    },

    resolveId(idResolve) {
      if (idResolve === Consts.devUrlPath) {

        pluginLogger.debug(`🔍 [${pc.blueBright('resolveId')}]  Resolved dev JSON endpoint: ${idResolve}`);
        return "\0" + Consts.devUrlPath

      }
      const id = idResolve.replaceAll(/\?\?.*/g, '');
      if (!id.startsWith(config.sourceId)) {
        return
      }

      const moduletoResolve = id.replace(config.sourceId, "")

      if (moduletoResolve === "") {
        return "\0" + config.sourceId;
      }


      pluginLogger.debug(`🔍 [${pc.blueBright('resolveId')}]  Resolved module: ${id} [${pc.yellow(moduletoResolve)}]`);
      return '\0' + id;

    },

    load(idLoad) {


      if (!idLoad.startsWith("\0")) {
        return
      }

      if (idLoad.includes(Consts.devUrlPath)) {
        // return
        return `export default ${combinedMessages.messagesJsonString}'`;

      }
      if (!idLoad.includes(config.sourceId)) {

        pluginLogger.debug(`📄 [${pc.green('load')}] Skipping non-virtual module load: ${pc.blue(idLoad)}`);
        return
      }

      const id = idLoad.replaceAll(/\?\?.*/g, '')
        // replace '\0' at start wit
        .replace("\0", '')
      const moduletoResolve = id.replace(config.sourceId, "")
        .replace(/^\//, '')

      pluginLogger.debug(`📄 [${pc.green('load')}] [${id}] loading [${pc.yellow(moduletoResolve)}]`);

      const code = createVirtualModuleCode({
        config: config,
        buildAssetRefId: config.emit.emitJson ? emittedRefId : undefined,
      }, combinedMessages);
      if (moduletoResolve === "") {

        pluginLogger.info(`📄 [${pc.green('load')}] Generated dev code for virtual module: ${id}`);
        return code.toFileContent()

      }

      const methodCode = code.getFileContentFor(moduletoResolve);
      pluginLogger.info(`📄 [${pc.green('load')}] Loading virtual sub-module: ${pc.yellow(moduletoResolve)}, length: ${methodCode.length}`);

      // pluginLogger.debug(`📄 [load (Sub-module)] Generated code for method: ${method} [${methodCode.substring(0, 30)}`);
      return methodCode;


    }
    ,

    configureServer(viteServer) {
      server = viteServer
      pluginLogger.info(`🌐 [configureServer] Hook triggered. Setting up dev server...`);

      // Set server reference for hot updates (use virtualId for module graph lookups)
      rebuildManager.setServer(server);
      pluginLogger.info(`🌐 [configureServer] Server reference set for virtual module: ${config.sourceId}`);


      const includePatterns = config.include;
      const excludePatterns = config.exclude;

      const watcherPatterns = [...includePatterns, ...excludePatterns];

      if (watcherPatterns.length > 0) {
        server.watcher.add(watcherPatterns);

        pluginLogger.debug(
          `🌐 [configureServer] Registered watcher patterns: ${watcherPatterns.join(", ")}`
        );

      }

      // Initial rebuild
      pluginLogger.info(`🌐 [configureServer] Triggering initial rebuild...`);
      rebuildManager.rebuild("initial", []).catch((e) => {
        pluginLogger.error(`Initial rebuild failed: ${String(e)}`);
      });


      // Debug endpoint
      if (config.debug) {
        // Serve locales JSON endpoint
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          if (req.url === Consts.devUrlPath) {
            pluginLogger.info(`🔗 [middleware] Serving JSON endpoint: ${req.url}, size: ${combinedMessages.keys.length} bytes`);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(combinedMessages.messages, null, 2))
            return;
          }
          next();
        });
        server.middlewares.use((req, res, next) => {
          if (req.url === Consts.debugUrlPath) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              files: lastFiles,
              all: combinedMessages.keys.length,
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

    async hotUpdate(hotUpdateOptions: HotUpdateOptions):
      Promise<
        EnvironmentModuleNode[] | void
      > {
      const {server, timestamp, type, modules, ...ctx} = hotUpdateOptions
// hotUpdateOptions.

      if (!isWatchedFile(ctx.file)) {
        pluginLogger.debug(`🔥 [hotUpdate] File not watched, skipping: ${ctx.file} for ${modules}`);
        return;
      }
      pluginLogger.info(`🔥 [hotUpdate] Hook triggered for file: ${ctx.file}, type: ${type}, timestamp: ${timestamp}`)

      pluginLogger.debug(`🔥 [hotUpdate] Environment: ${this.environment?.name}, modules count: ${modules.length}`);


      pluginLogger.debug(`🔥 [hotUpdate] Debug: Module details for ${type}:`);
      modules.forEach((m, i) => {
        pluginLogger.debug(`  Module ${i}: id=${m.id}, url=${m.url}, type=${m.type}`);
      });


      // Only process in client environment to avoid duplicate rebuilds
      if (this.environment?.name !== 'client') {
        pluginLogger.debug(`🔥 [hotUpdate] Skipping for non-client environment: ${this.environment?.name}`);
        return;
      }

      pluginLogger.debug(`🔥 [hotUpdate] Triggering rebuild for file change...`);
      rebuildManager.setEnv(this.environment);

      // Perform rebuild immediately (no debouncing needed in Vite 7)
      const result = await rebuildManager.rebuild("change", modules);

      // Send custom HMR event to update i18n messages directly
      pluginLogger.info(`🔥 [hotUpdate] Sending custom i18n-update event with new messages`);
      // todo use await ctx.read() to get changed file content
// pluginLogger.debug(`${JSON.stringify(await ctx.read())} vs ${JSON.stringify(result.messages)}`);
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
