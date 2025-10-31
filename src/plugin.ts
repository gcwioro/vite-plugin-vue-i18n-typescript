import path from "node:path";
import {promises as fs, type Stats} from "node:fs";
import {
  createLogger,
  type EnvironmentModuleNode,
  type HotUpdateOptions,
  normalizePath,
  type PluginOption,
  type ViteDevServer,
} from "vite";
import type {GenerationOptions, JSONObject, VirtualKeysDtsOptions} from "./types";
import {createVirtualModuleCode} from "./generation/generator";
import {Consts, normalizeConfig} from "./core/config";
import {FileManager, ParsedFile} from "./core/file-manager";

import {RebuildManager} from "./core/rebuild-manager";
import {CombinedMessages} from "./core/combined-messages";
import {createColoredLogger} from "./createConsoleLogger";
import pc from "picocolors";
import {
  CustomHotFileChangedPayload,
  CustomHotReplaceI18nPayload
} from "./generation/runtime/hrmHotUpdate.ts";


/**
 * Vite plugin for generating TypeScript definitions from Vue i18n locale files
 */
function vitePluginVueI18nTypescript(
  userOptions: VirtualKeysDtsOptions = {}
): PluginOption {
  // Normalize configuration


  // Plugin state
  let root = "";
  let pluginLogger = createColoredLogger(userOptions.debug ? 'debug' : 'info', {customLogger: createLogger(userOptions.debug ? 'info' : 'warn')});

  let config: GenerationOptions = normalizeConfig(userOptions, pluginLogger);

  let isBuild = false;
  let emittedRefId: string | undefined;
  let combinedMessages: CombinedMessages = new CombinedMessages({['en']: {test: ''}}, config);
  const lastFiles: string[] = [];

  // Core managers (initialized in configResolved)
  let fileManager: FileManager;

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
    // check if files ends with "??.json"
    if (abs.match(/\?\?.*\.json$/)) return false;

    // const rel = normalizePath(path.relative(root, abs));
    // if (rel.startsWith("..")) return false;


    pluginLogger.debug(`Checking file change: ${abs}`);


    return true;
  }

  const addOnAllFilesProcessedLogPrefix = `[${pc.bold(pc.bgGreenBright('addOnAllFilesProcessed'))}] - `;

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
      fileManager = new FileManager(config);

      await fileManager.findFiles();


      fileManager.addOnFileChanged(async file => {
        // todo merge only changed file
        pluginLogger.info(`File changed: ${file.localeKey}, updating emitted asset...`);
        const messagesCached = new CombinedMessages(fileManager.getGrouped(), config)
        await messagesCached.writeFiles(emittedRefId);
      });
      fileManager.addOnAllFilesProcessed(async (result) => {
        try {
          combinedMessages = result;
          await combinedMessages.writeFiles(emittedRefId);
          pluginLogger.info(`🚀 [${addOnAllFilesProcessedLogPrefix}] Rebuild complete. Locales: ${combinedMessages.languages.join(", ")}, Total Keys: ${combinedMessages.keys.length}`);

          combinedMessages.validateMessages()
        } catch (err) {
          pluginLogger.error(`Error in file processing callback: ${err}`);
          throw err;
        }
      })

      fileManager.addOnAllFilesProcessed(async () => {
        const errors = await fileManager.validateMessages()
        if (errors.length > 0) {
          pluginLogger.error(`🚀 [${addOnAllFilesProcessedLogPrefix}] Validation errors found in locale messages:`);
        }
      })
      const buildPromise = fileManager.readAndGroup()

      // if (isBuild) {
      await buildPromise;

      // let update = await fileManager.fileUpdated(id, () => src, Date.now())
      // cfg.server.warmup()
      // await checkTypesFileExists();
    },

    async buildStart() {

      pluginLogger.info(`🚀 [buildStart] Hook triggered. isBuild: ${isBuild}`);


      if (!isBuild) {
        const url = `http://localhost:${server.config.server.port}`;
        pluginLogger.info(`🌐 [buildStart] Debug endpoint enabled at ${pc.yellow(url + Consts.debugUrlPath)}`);
        pluginLogger.info(`🌐 [buildStart] Debug endpoint enabled at ${pc.yellow(url + Consts.devUrlPath)}`);

      }

      if (isBuild) {
        fileManager.addOnAllFilesProcessed(messages => {

          pluginLogger.info(`🚀 [${addOnAllFilesProcessedLogPrefix}] Emitting locale JSON asset: ${config.emit.fileName}`);
          this.emitFile({
            originalFileName: config.emit.fileName,
            fileName: config.emit.fileName,
            type: "asset",

            name: config.emit.fileName,
            source: messages.messagesJsonString,
          })

        })
        await fileManager.readAndGroup()
      }

      // if (isBuild) {
      //
      //
      //   emittedRefId = this.emitFile({
      //     originalFileName: config.emit.fileName,
      //     fileName: config.emit.fileName,
      //     type: "asset",
      //
      //     name: config.emit.fileName,
      //     source: combinedMessages.messagesJsonString,
      //   });
      //
      // }
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

    async configureServer(viteServer) {
      server = viteServer
      fileManager.addOnFileChanged(file => {
        viteServer.ws.send({
          type: 'custom',
          event: 'i18n-update',
          data: {
            messages: null,
            update: file.prepared as JSONObject,
            locale: file.localeKey,
            timestamp: Date.now()
          } as CustomHotFileChangedPayload
        });
      })
      fileManager.addOnAllFilesProcessed((result, change) => {
        pluginLogger.info(`${[addOnAllFilesProcessedLogPrefix]} Sending custom i18n-update event with new messages`);
        viteServer.ws.send({
          type: 'custom',
          event: 'i18n-update',
          data: {
            files: change,
            locale: undefined,
            messages: result,
            timestamp: new Date().getTime(),
          } as CustomHotReplaceI18nPayload
        });
      });

      pluginLogger.info(`🌐 [configureServer] Server reference set for virtual module: ${config.sourceId}`);

      // Only watch include patterns (exclude patterns start with "!" and should not be watched)
      const watcherPatterns = config.include;

      if (watcherPatterns.length > 0) {
        server.watcher.add(watcherPatterns);

        const watchPatternsString = watcherPatterns.map((pattern, i) => `${i + 1}.${pattern}`);
        pluginLogger.info(
          `🌐 [configureServer] Registered ${watcherPatterns.length} watcher patterns: ${watchPatternsString}`);


        // Listen for file changes directly from the watcher
        // let fileWatcherCb = async (file: string, stats?: Stats) => {
        //
        //   pluginLogger.info(`🔍 [watcher.change] Event fired for: ${file}`,{timestamp: true});
        //   const localeFromPath = config.getLocaleFromPath(file, config.root);
        //   if (localeFromPath) {
        //
        //     try {
        //       // Trigger full rebuild to regenerate types and send complete messages
        //       await fileManager.fileUpdatedWithLocale(file, localeFromPath);
        //       // await fileManager.readAndGroup();
        //     } catch (err) {
        //       pluginLogger.error(`🔍 [watcher.change] Error during rebuild: ${err}`);
        //     }
        //   } else {
        //     pluginLogger.debug(`🔍 [watcher.change] File not watched, skipping: ${file}`);
        //   }
        // };
        // server.watcher.on('change', fileWatcherCb);
        // server.watcher.on('add', fileWatcherCb);
      }

      // Initial rebuild
      pluginLogger.info(`🌐 [configureServer] Triggering initial rebuild...`);

      // Debug endpoint
      if (config.debug) {
        // Serve locales JSON endpoint
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          if (req.url === Consts.devUrlPath) {
            pluginLogger.info(`🔗 [middleware] Serving JSON endpoint: ${req.url}, size: ${combinedMessages.keys.length} bytes`);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.end(JSON.stringify({
              ...combinedMessages.messages,

            }, null, 2))
            return;
          }
          next();
        });
        server.middlewares.use((req, res, next) => {
          if (req.url === Consts.debugUrlPath) {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.end(JSON.stringify({
              all: combinedMessages.keys.length,
              base: combinedMessages.config.baseLocale,
              hash: combinedMessages.contentId,
              filesToProcess: fileManager.filesToProcess.size,
              files: fileManager.getLastFiles(),

              grouped: combinedMessages.messages
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
      pluginLogger.debug(`🔥 [${pc.red('hotUpdate')}] Called for file: ${ctx.file}`);

      if (!isWatchedFile(ctx.file)) {
        pluginLogger.debug(`🔥 [${pc.red('hotUpdate')}] File not watched, skipping: ${ctx.file}`);
        return;
      }
      const hotUpdatePrefix = `🔥 [${pc.red('hotUpdate')}] [${type}] [${pc.blueBright(this.environment?.name ?? 'unknown')}] - ${timestamp}`;
      pluginLogger.info(`${pc.red('hotUpdate')} Hook triggered for file: ${ctx.file}, type: ${type}, timestamp: ${timestamp}`, {timestamp: true})


      // Only process in client environment to avoid duplicate rebuilds
      const envName = this.environment?.name;
      if (envName && envName !== 'client') {
        pluginLogger.debug(`${hotUpdatePrefix} Skipping for non-client environment: ${envName}`);
        return;
      }


      // pluginLogger.debug(`${hotUpdatePrefix} Debug: Module details for ${type}:`);
      // modules.forEach((m, i) => {
      //   pluginLogger.debug(`  Module ${i}: id=${m.id}, url=${m.url}, type=${m.type}`);
      // });


      try {
        // Perform rebuild immediately (no debouncing needed in Vite 7)
        let update: ParsedFile | undefined | null = null
        if (type === 'update' || type === 'create') {
          update = await fileManager.fileUpdated(ctx.file, ctx.read)
        } else {
          await fileManager.fileRemoved(ctx.file)
        }

        if (update)
          pluginLogger.info(`${hotUpdatePrefix} File processed: ${ctx.file}, locale: ${update.localeKey} keys: ${Object.keys(update.prepared).length}`);


        // // Send custom HMR event to update i18n messages directly

// pluginLogger.debug(`${JSON.stringify(await ctx.read())} vs ${JSON.stringify(result.messages)}`);
        // Send the updated messages to the client


        // Return empty array to prevent default HMR behavior
        return [];
      } catch (e) {
        pluginLogger.error(`${hotUpdatePrefix} Hot update failed: ${String(e)}`);
        const grouped = fileManager.getGrouped();

      }
    },
  };
}


export {
  vitePluginVueI18nTypescript,
  vitePluginVueI18nTypescript as vitePluginVueI18nTypes,
  vitePluginVueI18nTypescript as default
}
