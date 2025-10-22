// HelperMethods.ts
import {CombinedMessages} from "../core/combined-messages";
import {GenerationOptions} from "../core/generation-coordinator";

import translateWrapperFunction from "./runtime/translateWrapperFunction.ts??inline";

/** String enum keeps runtime minimal and DX straightforward */
export enum SymbolEnum {
  imports = "_imports",
  messages = "messages",
  hrmHotUpdate = "_hrmHotUpdate",

  useI18nApp = "useI18nApp",
  availableLocales = "availableLocales",
  fallbackLocales = "fallbackLocales",
  translationWrapper = "translationWrapper",
  createI18nInstance = "createI18nInstance",
  createI18nInstancePlugin = "createI18nInstancePlugin",
  useI18nTypeSafe = "useI18nTypeSafe",
}

/** Shorthand constants if you prefer named references */
export const imports = SymbolEnum.imports;
export const messages = SymbolEnum.messages;
export const hrmHotUpdate = SymbolEnum.hrmHotUpdate;
export const availableLocales = SymbolEnum.availableLocales;
export const useI18nApp = SymbolEnum.useI18nApp;
export const fallbackLocales = SymbolEnum.fallbackLocales;
export const translationWrapper = SymbolEnum.translationWrapper;
export const createI18nInstance = SymbolEnum.createI18nInstance;
export const createI18nInstancePlugin = SymbolEnum.createI18nInstancePlugin;
export const useI18nTypeSafe = SymbolEnum.useI18nTypeSafe;


import deepMerge from '../utils/merge.ts??inline';
import hotUpdateCallback from "./runtime/hrmHotUpdate.ts??inline";
import codeCreateI18nInstance from "./runtime/createI18nInstance??inline";



// HMR handling for live updates
export const codeHrmHotUpdate = `

let cachedMessages = {};
if (import.meta.hot) {
${deepMerge}
${hotUpdateCallback}
  import.meta.hot.on('i18n-update', (data) => {
 cachedMessages = hrmHotUpdate(cachedMessages,data, globalThis.i18nApp.global,deepMerge);

  });
}`

export type HelperMethodsRecord = Record<SymbolEnum, string>;
// type that has every key of SymbolEnum as ker
// ys
// type HelperMethodsOrderKeys = keyof typeof HelperMethodsOrder;
// type _HelperMethods = Record<HelperMethodsOrderKeys, SymbolEnum>;
/** Stable order for full-file serialization */
// export const HelperMethodsOrder: HelperMethodsRecord = {
//
//
//   [SymbolEnum.imports.toString()]: 'imports',
//   [messages.toString()]: SymbolEnum.messages,
//   useI18nApp: SymbolEnum.useI18nApp,
//   fallbackLocales: SymbolEnum.fallbackLocales,
//   [availableLocales.toString()]: SymbolEnum.availableLocales,
//
//   translationWrapper: SymbolEnum.translationWrapper,
//   createI18nInstance: SymbolEnum.createI18nInstance,
//   createI18nInstancePlugin: SymbolEnum.createI18nInstancePlugin,
//   useI18nTypeSafe: SymbolEnum.useI18nTypeSafe,
// } as HelperMethodsRecord;

/** All sections resolve to strings */


export interface RuntimeGenerationParams {
  config: GenerationOptions,
  buildAssetRefId?: string,
}

/** Builder: produces the enum-keyed record */
function buildRuntimeMethods(ops: RuntimeGenerationParams, messagesCombined: CombinedMessages): HelperMethodsRecord {
  const {config} = ops;

  function getMessages() {
    // When inlineDataInBuild is true, always inline the data directly
    // This avoids issues with virtual JSON modules in library builds
    if (ops.buildAssetRefId) {
      ops.config.logger.info(`buildAssetRefId: ${ops.buildAssetRefId}`)

      return `export const messages = import.meta.ROLLUP_FILE_URL_${ops.buildAssetRefId}`
    } else if (config.emit.inlineDataInBuild) {
      return `export const messages = ${messagesCombined.messagesJsonString};`

      // } else if (config.virtualJsonId) {
      //   return `
      //   import messageJson from '${config.virtualJsonId}'
      //
      //   export const messages = messageJson
      //
      //   `
    } else {

      const messagesImportedFromServer = `export const messages = ${messagesCombined.messagesJsonString};');`
      config.logger.warn(messagesImportedFromServer)
      return messagesImportedFromServer
    }
  }

  return {
    [imports]: "import { createI18n, useI18n } from 'vue-i18n';",
    [messages]: getMessages(),
    [availableLocales]: `export const availableLocales = ${messagesCombined.languagesTuple()};`,
    [fallbackLocales]: `export const fallbackLocales = ${JSON.stringify(messagesCombined.fallbackLocales)};`,
    [hrmHotUpdate]: codeHrmHotUpdate,
    [useI18nApp]: "export const useI18nApp = () => globalThis.i18nApp.global;",


    [translationWrapper]: 'export ' + translateWrapperFunction,
    [createI18nInstance]: 'export ' + codeCreateI18nInstance,
    [createI18nInstancePlugin]: 'export const createI18nInstancePlugin = createI18nInstance;',
    [useI18nTypeSafe]:
      `export function useI18nTypeSafe(options) {
  const { t: originalT, d, n, ...rest } = useI18n({

    ...(options ?? {}),
  });
  return {
    ...rest,
    t: translateWrapperFunction(originalT),
    d,
    n,
  };
}`,
  } as const;
}

/** Options for file output */
export interface ToFileOptions {
  /** Join string between sections (default: "\n\n") */
  separator?: string;
  /** Optional banner/header comment */
  banner?: string;
  /** Ensure directory exists (mkdir -p), default true */
  ensureDir?: boolean;
}


/** Typed, compact class with ergonomic helpers */
export class RuntimeMethods {
  private readonly _data: HelperMethodsRecord;

  constructor(ops: RuntimeGenerationParams, messagesCombined: CombinedMessages) {
    this._data = buildRuntimeMethods(ops, messagesCombined);
  }


  /** Deterministic full-file content (all sections in HelperMethodsOrder) */
  toFileContent(defaultExport = 'messages'): string {
    return Object.values(this._data).join("\n\n") + 'export default ' + defaultExport;
  }

  parseSymbolEnumKey(key: string | SymbolEnum): string | undefined {
    for (const [keyFound, contentFound] of Object.entries(this._data)) {


      if (keyFound.toString() == key.toString()) {
        return contentFound;
      }

    }
    return undefined;
  }


  getFileContentFor(target: string | SymbolEnum, separator = "\n\n"): string {
    // remove "??*" from target

    const resolved = this.parseSymbolEnumKey(target);

    const resolvedCode = resolved;//? this._data?.[resolved] : this._data?.[target];
    if (!resolvedCode) {
      // throw new Error(`getFileContentFor: No code found for target "${target}". Available keys: ${Object.keys(this._data).join(", ")}`);
      console.error(`getFileContentFor: No code found for target "${target}". Available keys: ${Object.entries(this._data).join(", ")}`);
      return this.toFileContent(target);
    }

    // For sub-modules, we only need the specific export, not vue-i18n imports
    // unless the module needs them (like useI18nTypeSafe)
    const needsVueI18nImports = ['useI18nTypeSafe', 'createI18nInstance', 'createI18nInstancePlugin'].includes(target);
    const importsCode = needsVueI18nImports ? this._data[imports] : '';

    // Messages, availableLocales, and fallbackLocales are already exported in resolvedCode
    // so we don't need to add 'export default'
    const needsDefaultExport = true;//!['messages', 'availableLocales', 'fallbackLocales', 'useI18nApp', 'translationWrapper', 'useI18nTypeSafe', 'createI18nInstance', 'createI18nInstancePlugin'].includes(target);
    const defaultExportCode = needsDefaultExport ? `export default ${target}` : '';

    const parts = [importsCode, resolvedCode, defaultExportCode].filter(Boolean);
    return parts.join(separator);
  }
}
