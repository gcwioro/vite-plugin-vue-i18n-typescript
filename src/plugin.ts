import path from "node:path";
import {promises as fs} from "node:fs";
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
import {CustomHotModuleUpdatePayload} from "./generation/runtime/hrmHotUpdate.ts";


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
  let lastFiles: string[] = [];

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
      await fileManager.processFile();
      rebuildManager = new RebuildManager({
        fileManager,

        root,
        logger: pluginLogger,
        config: {...config, logger: pluginLogger},
        onRebuildComplete: (cache) => {

          const grouped = fileManager.getGrouped();
          combinedMessages = new CombinedMessages(grouped, config)
          if (!isBuild) {
            server.ws.send({
              type: 'custom',
              event: 'i18n-update',
              data: {
                locale: undefined,
                messages: combinedMessages,
                timestamp: new Date().getTime(),
              } as CustomHotModuleUpdatePayload
            });
          }
        }

      });

      if (isBuild) {
        await rebuildManager.rebuild("initial", emittedRefId);
      }
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

      combinedMessages = new CombinedMessages(fileManager.getGrouped(), config)
      await combinedMessages.writeFiles(emittedRefId);

      const buildPromise = rebuildManager.rebuild("buildStart", emittedRefId).then(async result => {

        combinedMessages = result.messages;
        if (isBuild)
          this.emitFile({
            originalFileName: config.emit.fileName,
            fileName: config.emit.fileName,
            type: "asset",

            name: config.emit.fileName,
            source: combinedMessages.messagesJsonString,
          })
        combinedMessages.validateMessages()
        await combinedMessages.writeFiles(emittedRefId);
        pluginLogger.info(`🚀 [buildStart] Rebuild complete. Locales: ${combinedMessages.languages.join(", ")}, Total Keys: ${combinedMessages.keys.length}`);
      })

      if (isBuild) {
        await buildPromise;

        emittedRefId = this.emitFile({
          originalFileName: config.emit.fileName,
          fileName: config.emit.fileName,
          type: "asset",

          name: config.emit.fileName,
          source: combinedMessages.messagesJsonString,
        });

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

    async moduleParsed(module) {
      pluginLogger.info(`Module parsed: ${module.id}`);
      const grouped = fileManager.getGrouped();
      const messagesCached = new CombinedMessages(grouped, config)
      await messagesCached.writeFiles(emittedRefId);

    },
    //
    // async transform(src, id) {
    //   let hotUpdatePrefix = `🔧 [${pc.magenta('transform')}] - ${normalizePath(id)}`;
    //   if (!isWatchedFile(id)) {
    //
    //     pluginLogger.debug(`${hotUpdatePrefix} File not watched, skipping: ${id} `);
    //     return;
    //   }
    //   this.addWatchFile(id);
    //   pluginLogger.debug(`${hotUpdatePrefix} File transform: ${id} ${src} bytes`);
    //   let update = await fileManager.fileUpdated(id, () => src, Date.now())
    //
    //
    //   if (!update) {
    //     pluginLogger.warn(`${hotUpdatePrefix} No update information returned for file: ${id}`);
    //     return;
    //   }
    //   pluginLogger.info(`${hotUpdatePrefix} File processed: ${id}, locale: ${update.localeKey} keys: ${Object.keys(update.prepared).length}`);
    //
    //
    //   // // Send custom HMR event to update i18n messages directly
    //   pluginLogger.info(`${hotUpdatePrefix} Sending custom i18n-update event with new messages`);
    //
    //   // const grouped = fileManager.getGrouped();
    //   // const messagesCached = new CombinedMessages(grouped, config)
    //   // // await messagesCached.writeFiles(emittedRefId);
    //
    //   return {code: src, map: null};
    // },
// transform(src, id, ut) {
//     pluginLogger.info(id + ' - ' + JSON.stringify(ut));
//
//     // replace useI18nTypeSafe with useI18nApp().tmp('keyMatchingFile')
//     if (id.endsWith('.vue')) {
//       const keyForFile = id.split('/').pop()?.replace('.vue', '') ;
//
//       const foundKeys =lastFiles.filter(file => file.includes(keyForFile))//combinedMessages.keys.filter(key =>  key.endsWith(keyForFile)) ;
//
//
//       if(foundKeys.length >0) {
//          pluginLogger.warn(`🔧 [${pc.magenta('transform')}] Processing .vue file: ${pc.blue(id)} with key fragment: ${foundKeys} ${pc.yellow(keyForFile)}`);
//         pluginLogger.info(`🔧 [${pc.magenta('transform')}] Found matching keys for .vue file: ${pc.blue(id)} => ${pc.yellow(foundKeys.join(', '))}`);
//       // const transformed = src.replaceAll(/useI18n\(\)/g, `( import ("virtual:vue-i18n-types/useI18nTypeSafe??raw")).useI18nTypeSafe()`)//'${keyForFile}')`);
//          const transformed = src.replaceAll(/useI18nTypeSafe\(\)/g, `useI18nTypeSafe({messages: globalThis?.i18nModule?.global.tm('${keyForFile}')});\nconsole.error('${keyForFile}',globalThis?.i18nModule?.global.tm('${keyForFile}'))`)//'${keyForFile}')`);
//
//       if (transformed !== src) {
//         pluginLogger.info(`🔧 [${pc.magenta('transform')}] Transformed useI18nTypeSafe in: ${pc.blue(id)}`);
//       }
//       return transformed;
//       }
//
//     }
// },
    async configureServer(viteServer) {
      server = viteServer
      pluginLogger.info(`🌐 [configureServer] Hook triggered. Setting up dev server...`);

      // Set server reference for hot updates (use virtualId for module graph lookups)
      rebuildManager.setServer(server);
      pluginLogger.info(`🌐 [configureServer] Server reference set for virtual module: ${config.sourceId}`);

      const watcherPatterns = [...(config.include), ...(config.exclude)];

      if (watcherPatterns.length > 0) {
        server.watcher.add(watcherPatterns);


        pluginLogger.debug(
          `🌐 [configureServer] Registered watcher patterns: ${watcherPatterns.join(", ")}`
        );

      }

      // Initial rebuild
      pluginLogger.info(`🌐 [configureServer] Triggering initial rebuild...`);
      // rebuildManager.rebuild("initial", []).catch((e) => {
      //   pluginLogger.error(`Initial rebuild failed: ${String(e)}`);
      // });
// rebuildManager.rebuild("initial", []).catch((e) => {
//         pluginLogger.error(`Initial rebuild failed: ${String(e)}`);
//       });

      // Debug endpoint
      if (config.debug) {
        // Serve locales JSON endpoint
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();

          if (req.url === Consts.devUrlPath) {
            pluginLogger.info(`🔗 [middleware] Serving JSON endpoint: ${req.url}, size: ${combinedMessages.keys.length} bytes`);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
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
            res.end(JSON.stringify({

              files: fileManager.getLastFiles(),
              all: combinedMessages.keys.length,
              grouped: combinedMessages.messages,
              base: combinedMessages.config.baseLocale
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

        // pluginLogger.debug(`${hotUpdatePrefix} File not watched, skipping: ${ctx.file} for ${modules}`);
        return;
      }
      let hotUpdatePrefix = `🔥 [${pc.red('hotUpdate')}] [${type}] [${pc.blueBright(this.environment.name)}] - ${timestamp}`;
      pluginLogger.info(`hotUpdatePrefix Hook triggered for file: ${ctx.file}, type: ${type}, timestamp: ${timestamp}`)


      // Only process in client environment to avoid duplicate rebuilds
      if (this.environment?.name !== 'client') {
        // pluginLogger.debug(`${hotUpdatePrefix} Skipping for non-client environment: ${this.environment?.name}`);
        return;
      }


      pluginLogger.debug(`${hotUpdatePrefix} Debug: Module details for ${type}:`);
      modules.forEach((m, i) => {
        pluginLogger.debug(`  Module ${i}: id=${m.id}, url=${m.url}, type=${m.type}`);
      });

      rebuildManager.setEnv(this.environment);
      try {
        // Perform rebuild immediately (no debouncing needed in Vite 7)
        let update: ParsedFile | undefined | null = null
        if (type === 'update' || type === 'create') {
          update = await fileManager.fileUpdated(ctx.file, ctx.read, timestamp)
        } else {
          await fileManager.fileRemoved(ctx.file, ctx.read, timestamp)
        }

        if (!update) {
          pluginLogger.warn(`${hotUpdatePrefix} No update information returned for file: ${ctx.file}`);
          return;
        }
        pluginLogger.info(`${hotUpdatePrefix} File processed: ${ctx.file}, locale: ${update.localeKey} keys: ${Object.keys(update.prepared).length}`);


        // // Send custom HMR event to update i18n messages directly
        pluginLogger.info(`${hotUpdatePrefix} Sending custom i18n-update event with new messages`);
// pluginLogger.debug(`${JSON.stringify(await ctx.read())} vs ${JSON.stringify(result.messages)}`);
        // Send the updated messages to the client

        server.ws.send({
          type: 'custom',
          event: 'i18n-update',
          data: {
            messages: null,
            update: update.prepared as JSONObject,
            locale: update.localeKey,
            timestamp
          } as CustomHotModuleUpdatePayload
        });
        const grouped = fileManager.getGrouped();
        const messagesCached = new CombinedMessages(grouped, config)
        await messagesCached.writeFiles(emittedRefId);
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
