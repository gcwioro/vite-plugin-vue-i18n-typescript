// import path from "node:path";
// import {promises as fs} from "node:fs";
// import type {Plugin, ViteDevServer} from "vite";
// import {normalizePath} from "vite";
// import fg from "fast-glob";
// import {canonicalize, detectKeyConflicts, ensureDir, writeFileAtomic} from "./utils";
// import {JSONObject, JSONValue, VirtualKeysDtsOptions} from "./types";
// import {toConstsContent, toTypesContent} from "./generator";
//
// export interface LocaleJsonPluginOptions {
//   include?: string | string[];
//   exclude?: string | string[];
//   virtualId?: string;
//   getLocaleFromPath?: (absFilePath: string, root: string) => string | null;
//   merge?: "deep" | "shallow";
//   transformJson?: (json: unknown, absFilePath: string) => unknown;
//   devUrlPath?: string;
//   emit?: {
//     fileName?: string;
//     inlineDataInBuild?: boolean;
//   };
//   debug?: boolean;
// }
//
// /* ------------------------ helpers ------------------------ */
//
// function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
//   if (target === source) return target;
//   if (Array.isArray(target) && Array.isArray(source)) return source as T;
//   if (
//     target &&
//     source &&
//     typeof target === "object" &&
//     typeof source === "object" &&
//     !Array.isArray(target) &&
//     !Array.isArray(source)
//   ) {
//     const out: Record<string, any> = {...target};
//     for (const key of Object.keys(source)) {
//       out[key] = key in target ? deepMerge(target[key], (source as any)[key]) : (source as any)[key];
//     }
//     return out as T;
//   }
//   return source;
// }
//
// const shallowMerge = <T extends Record<string, any>>(a: T, b: T) => Object.assign({}, a, b);
//
// function defaultGetLocaleFromPath(filePath: string): string | null {
//
//   // example path: src/locales/Asdf.vue.en.json -> en
//   // example path: src/locales/en.json -> en
//   const fileName = path.basename(filePath); // Get the file name from the path
//   const parts = fileName.split('.')
//   // last part is json
//   if (parts.length < 2 || parts[parts.length - 1] !== 'json') {
//     return null; // Not a JSON file
//   }
//   return parts[parts.length - 2]; // Return the locale code (second to last part)
//
//
// }
//
// const toArray = <T, >(v?: T | T[]) => (Array.isArray(v) ? v : v ? [v] : []);
//
// function log(server: ViteDevServer | undefined, enabled: boolean | undefined, ...args: any[]) {
//   if (!enabled) return;
//   const prefix = "[vite-plugin-locale-json]";
//   if (server) server.config.logger.info(prefix + " " + args.join(" "));
//   else console.log(prefix, ...args);
// }
//
// /**
//  * Emit **pure JS** (no TS annotations, no `as const`).
//  * Rollup will replace `import.meta.ROLLUP_FILE_URL_<ref>` in build.
//  */
// function createVirtualModuleCode(opts: {
//   jsonText: string;
//   exportData: boolean;
//   buildAssetRefId?: string;
//   devUrlPath?: string;
// }) {
//   const {jsonText, exportData, buildAssetRefId, devUrlPath} = opts;
//
//   const urlExpr = buildAssetRefId
//     ? `import.meta.ROLLUP_FILE_URL_${buildAssetRefId}`
//     : JSON.stringify(devUrlPath || "/_virtual_locales.json");
//
//   // Pure JS. If you want types, add an ambient .d.ts for "virtual:locales".
//   if (exportData) {
//     // Inline the data directly in the module
//     return `
// const url = ${urlExpr};
//
// export async function load() {
//   const res = await fetch(url, { credentials: 'same-origin' });
//   if (!res.ok) throw new Error('Failed to load locales: ' + res.status);
//   return await res.json();
// }
//
// export default ${jsonText};
// `;
//   } else {
//     // Don't inline the data, only provide the load function
//     return `
// const url = ${urlExpr};
//
// export async function load() {
//   const res = await fetch(url, { credentials: 'same-origin' });
//   if (!res.ok) throw new Error('Failed to load locales: ' + res.status);
//   return await res.json();
// }
//
// export default undefined;
// `;
//   }
// }
//
// /* ------------------------ plugin ------------------------ */
//
// export default function localeJsonPlugin(userOptions: LocaleJsonPluginOptions & VirtualKeysDtsOptions = {}): Plugin {
//   const options: Required<Omit<LocaleJsonPluginOptions, "transformJson" | "emit">> & {
//     transformJson?: LocaleJsonPluginOptions["transformJson"];
//     emit: Required<NonNullable<LocaleJsonPluginOptions["emit"]>>;
//
//   } & VirtualKeysDtsOptions = {
//     ...userOptions,
//     include: userOptions.include ?? ["src/locales/**/*.json"],
//     exclude: userOptions.exclude ?? [
//       "**/node_modules/**",
//       "**/.git/**",
//       "**/dist/**",
//       "**/.output/**",
//       "**/.vercel/**",
//       "**/.next/**",
//       "**/build/**",
//     ],
//     baseLocale: userOptions.baseLocale ?? 'de',
//     virtualId: userOptions.virtualId ?? '@unplug-i18n-types-locales',
//     getLocaleFromPath: userOptions.getLocaleFromPath ?? defaultGetLocaleFromPath,
//     merge: userOptions.merge ?? "deep",
//     transformJson: userOptions.transformJson,
//     devUrlPath: userOptions.devUrlPath ?? "/_virtual_locales.json",
//     emit: {
//       fileName: userOptions.emit?.fileName ?? "assets/locales.json",
//       inlineDataInBuild: userOptions.emit?.inlineDataInBuild ?? true,
//     },
//     debug: userOptions.debug ?? false,
//   };
//   const {
//     sourceId = '@unplug-i18n-types-locales',//@intlify/unplugin-vue-i18n/messages',
//     typesPath = 'src/i18n/i18n.types.gen.d.ts',
//     constsPath = 'src/i18n/i18n.gen.ts',
//
//     baseLocale = 'de',
//     banner,
//     exportMessages = false
//
//   } = options || {}
//   const VIRTUAL_ID = options.virtualId;
//   const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;
//
//   const doMerge = options.merge === "deep" ? deepMerge : shallowMerge;
//
//   let root = "";
//   let serverRef: ViteDevServer | undefined;
//
//   let groupedCache: Record<string, any> = {};
//   let jsonTextCache = "{}";
//   let lastFiles: string[] = [];
//
//   let isBuild = false;
//   let emittedRefId: string | undefined;
//
//   async function collectJsonFiles(): Promise<string[]> {
//     const patterns = toArray(options.include);
//     const ignore = toArray(options.exclude);
//     const entries = await fg(patterns, {
//       cwd: root,
//       ignore,
//       absolute: true,
//       onlyFiles: true,
//       dot: false
//     });
//     entries.sort((a, b) => a.localeCompare(b));
//     return entries;
//   }
//
//   async function readAndGroup(): Promise<Record<string, any>> {
//     const files = await collectJsonFiles();
//     lastFiles = files;
//     const grouped: Record<string, any> = {};
//
//     for (const abs of files) {
//       const localeKey = options.getLocaleFromPath(abs, root);
//       if (!localeKey) {
//         console.warn(`Skipping file with invalid locale: ${abs}`);
//         continue;
//       }
//       console.warn(`${abs} -> ${localeKey}`);
//       try {
//         const raw = await fs.readFile(abs, "utf8");
//         const parsed = JSON.parse(raw);
//         const prepared = options.transformJson ? options.transformJson(parsed, abs) : parsed;
//         if (!(localeKey in grouped)) grouped[localeKey] = {};
//         grouped[localeKey] = doMerge(grouped[localeKey], prepared);
//       } catch (err: any) {
//         const message = `Failed to parse/merge JSON: ${abs}\n${err?.message ?? err}`;
//         if (serverRef) serverRef.config.logger.error(message);
//         else console.error(message);
//         if (!serverRef) throw err;
//       }
//     }
//
//
//     return grouped;
//   }
//
//   async function rebuild(reason: string) {
//     groupedCache = await readAndGroup();
//     jsonTextCache = JSON.stringify(canonicalize(groupedCache));
//     log(serverRef, options.debug, `Rebuilt (${reason}). Locales: ${Object.keys(groupedCache).join(", ")}`, VIRTUAL_ID);
//
//     // Generate TypeScript definition files
//     if (typesPath && constsPath) {
//       await generateFile(groupedCache, root);
//     }
//
//     if (serverRef) {
//
//       const mod = serverRef.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
//       if (mod) {
//         await serverRef.moduleGraph.invalidateModule(mod);
//         serverRef.ws.send({
//           type: "full-reload",
//           path: "*"
//         });
//         //
//         // serverRef.ws.send({
//         //   type: "update",
//         //   updates: [{
//         //     type: "js-update",
//         //     data: result.constsContent,
//         //     path: 'xxx',
//         //     acceptedPath: 'xxx',
//         //     timestamp: Date.now()
//         //   }],
//         // });
//
//
//         // if(options.constsPath)
//         // emitConstRefId = serverRef.emitFile({
//         //   type: "asset",
//         //   name: options.constsPath,
//         //   source: result.constsContent,
//         // });
//         //   if(options.typesPath)
//         //   emitTypesRefId = this.emitFile({
//         //   type: "asset",
//         //   name: options.typesPath,
//         //   source: result.constsContent,
//         // });
//       }
//     }
//   }
//
//   function isWatchedFile(file: string): boolean {
//     const abs = normalizePath(file);
//     if (!abs.endsWith(".json")) return false;
//     const rel = normalizePath(path.relative(root, abs));
//     if (rel.startsWith("..")) return false;
//     return true;
//   }
//
//   async function generateFileContent(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, rootDir: string) {
//     // 2) Gather languages & select base locale
//     const languages = Object.keys(value)
//
//
//     const base = (value[baseLocale] ?? value[languages[0]]) as JSONObject | undefined
//     if (!base || typeof base !== 'object' || Array.isArray(base)) {
//       log(serverRef, options.debug,
//         `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
//       )
//     }
//
//     // Check for conflicting keys across locales
//     const conflicts = detectKeyConflicts(value)
//     if (conflicts.length > 0) {
//       log(serverRef, options.debug, '⚠️  Conflicting translation keys detected:', {timestamp: true})
//       for (const conflict of conflicts) {
//         log(serverRef, options.debug, `   ${conflict}`, {timestamp: true})
//       }
//     }
//
//     // 3) Deterministic inputs for DTS
//     const sortedLanguages = Array.from(new Set(languages.filter(a => a != ' js-reserved'))).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
//     const canonicalBase = canonicalize(value as JSONValue) as Record<string, JSONValue>
//     const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath)
//     const constsOutPath = path.isAbsolute(constsPath) ? constsPath : path.join(rootDir, constsPath)
//
//     const relativePathToTypes = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\\.d\\.ts$/, '')
//     // 4) Generate dual files
//     // Generate two separate files
//     const typesContent = toTypesContent({
//       messages: canonicalBase,
//       baseLocale: baseLocale,
//       supportedLanguages: sortedLanguages,
//       banner,
//     })
//
//     const constsContent = toConstsContent({
//       messages: canonicalBase,
//       typeFilePath: './' + relativePathToTypes,
//       baseLocale: baseLocale,
//       supportedLanguages: sortedLanguages,
//       banner,
//       exportMessages,
//       sourceId: sourceId
//     })
//     // Update import path in consts file to point to types file
//     const relativePath = path.relative(path.dirname(constsOutPath), typesOutPath).replace(/\\.d\\.ts$/, '')
//     const adjustedConstsContent = constsContent.replace(
//       `from './i18n.types'`,
//       `from './${relativePath}'`
//     )
//     return {constsContent: adjustedConstsContent, typesContent}
//   }
//
//   async function generateFile(value: Record<string, string | number | boolean | JSONObject | JSONValue[] | null>, rootDir: string) {
//     // 2) Gather languages & select base locale
//     const start = (globalThis.performance?.now?.() ?? Date.now())
//     console.log(value)
//     const languages = Object.keys(value)
//
//
//     const base = (value[baseLocale] ?? value[languages[0]]) as JSONObject | undefined
//     if (!base || typeof base !== 'object' || Array.isArray(base)) {
//       log(serverRef, options.debug,
//         `Could not resolve base locale "${baseLocale}". Available: ${Object.keys(value).join(", ")} .`
//       )
//     }
//
//     // Check for conflicting keys across locales
//     const conflicts = detectKeyConflicts(value)
//     if (conflicts.length > 0) {
//       log(serverRef, options.debug, '⚠️  Conflicting translation keys detected:', {timestamp: true})
//       for (const conflict of conflicts) {
//         log(serverRef, options.debug, `   ${conflict}`, {timestamp: true})
//       }
//     }
//
//     // 3) Deterministic inputs for DTS
//     const typesOutPath = path.isAbsolute(typesPath) ? typesPath : path.join(rootDir, typesPath)
//     const constsOutPath = path.isAbsolute(constsPath) ? constsPath : path.join(rootDir, constsPath)
//
//     // 4) Generate dual files
//     // Generate two separate files
//     const {
//       constsContent: adjustedConstsContent,
//       typesContent
//     } = await generateFileContent(value, rootDir)
//     // Write types file
//     await ensureDir(typesOutPath)
//
//     let shouldWriteTypes: boolean
//     try {
//       const existing = await fs.readFile(typesOutPath, 'utf8')
//       shouldWriteTypes = existing !== typesContent
//     } catch {
//       shouldWriteTypes = true
//     }
//
//     if (shouldWriteTypes) {
//       await writeFileAtomic(typesOutPath, typesContent)
//       try {
//         // server.watcher.add(typesOutPath)
//         // server.watcher.emit('change', typesOutPath)
//       } catch {
//         // watcher may not be ready in build mode
//         // logger.warn('Watcher not ready to track types file changes.', {timestamp: true})
//       }
//     }
//
//     // Write consts file
//     await ensureDir(constsOutPath)
//
//
//     let shouldWriteConsts: boolean
//     try {
//       const existing = await fs.readFile(constsOutPath, 'utf8')
//       shouldWriteConsts = existing !== adjustedConstsContent
//     } catch {
//       shouldWriteConsts = true
//     }
//
//     if (shouldWriteConsts) {
//       await writeFileAtomic(constsOutPath, adjustedConstsContent)
//       try {
//         // server.watcher.add(constsOutPath)
//         // server.watcher.emit('change', constsOutPath)
//       } catch {
//         // watcher may not be ready in build mode
//       }
//     }
//     log(serverRef, options.debug,
//       `Generated ${path.relative(rootDir, typesOutPath)} and ${path.relative(rootDir, constsOutPath)} in ${Math.round((globalThis.performance?.now?.() ?? Date.now()) - start)}ms`,
//     )
//     return {constsContent: adjustedConstsContent, typesContent}
//   }
//
//   return {
//     name: "vite-plugin-locale-json",
//     enforce: "pre",
//
//     configResolved(cfg) {
//       root = cfg.root;
//       isBuild = cfg.command === "build";
//     },
//
//     async buildStart() {
//       groupedCache = await readAndGroup();
//       jsonTextCache = JSON.stringify(canonicalize(groupedCache));
//       await generateFileContent(groupedCache, root)
//       if (isBuild) {
//         emittedRefId = this.emitFile({
//           type: "asset",
//           name: options.emit.fileName,
//           source: jsonTextCache,
//         });
//         console.log(emittedRefId)
//         await generateFile(groupedCache, root)
//       }
//
//     },
//
//     resolveId(id) {
//       if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
//       return null;
//     },
//
//     load(id) {
//       if (id !== RESOLVED_VIRTUAL_ID) return null;
//
//       if (isBuild) {
//         return createVirtualModuleCode({
//           jsonText: jsonTextCache,
//           exportData: !!options.emit.inlineDataInBuild,
//           buildAssetRefId: emittedRefId,
//         });
//       }
//
//       return createVirtualModuleCode({
//         jsonText: jsonTextCache,
//         exportData: true,
//         devUrlPath: options.devUrlPath,
//       });
//     },
//
//     configureServer(server) {
//       serverRef = server;
//
//       // Initial build + middleware
//       rebuild("initial").catch((e) => server.config.logger.error(String(e)));
//
//       const servePath = options.devUrlPath;
//       server.middlewares.use((req, res, next) => {
//         if (!req.url) return next();
//         if (req.url === servePath) {
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "application/json; charset=utf-8");
//           res.end(jsonTextCache);
//           return;
//         }
//         next();
//       });
//
//       if (options.debug) {
//         server.middlewares.use((req, res, next) => {
//           if (req.url === "/__locales_debug__") {
//             res.setHeader("Content-Type", "application/json");
//             res.end(JSON.stringify({files: lastFiles, grouped: groupedCache}, null, 2));
//             return;
//           }
//           next();
//         });
//       }
//     },
//
//     async handleHotUpdate(ctx) {
//       if (!isWatchedFile(ctx.file)) return;
//       await rebuild("change");
//       const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
//       return mod ? [mod] : [];
//     },
//   };
// }
