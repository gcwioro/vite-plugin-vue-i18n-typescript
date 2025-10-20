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
  supportedLanguages = "supportedLanguages",
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
export const supportedLanguages = SymbolEnum.supportedLanguages;
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
 cachedMessages = hrmHotUpdate(cachedMessages,data, globalThis.i18nApp,deepMerge);

  });
}`

export type HelperMethodsRecord = Record<SymbolEnum, string>;
// type that has every key of SymbolEnum as ker
// ys
type HelperMethodsOrderKeys = keyof typeof HelperMethodsOrder;
type _HelperMethods = Record<HelperMethodsOrderKeys, SymbolEnum>;
/** Stable order for full-file serialization */
export const HelperMethodsOrder: HelperMethodsRecord = {


  [SymbolEnum.imports.toString()]: 'imports',
  [messages.toString()]: SymbolEnum.messages,
  useI18nApp: SymbolEnum.useI18nApp,
  fallbackLocales: SymbolEnum.fallbackLocales,
  [supportedLanguages.toString()]: SymbolEnum.supportedLanguages,

  translationWrapper: SymbolEnum.translationWrapper,
  createI18nInstance: SymbolEnum.createI18nInstance,
  createI18nInstancePlugin: SymbolEnum.createI18nInstancePlugin,
  useI18nTypeSafe: SymbolEnum.useI18nTypeSafe,
} as HelperMethodsRecord;

/** All sections resolve to strings */


export type RuntimeGenerationParams = {
  config: GenerationOptions,
  buildAssetRefId?: string,
};

/** Builder: produces the enum-keyed record */
function buildRuntimeMethods(ops: RuntimeGenerationParams, messagesCombined: CombinedMessages): HelperMethodsRecord {
  const {config} = ops;

  function getMessages() {
    if (config.virtualJsonId) {
      return `
      import messageJson from '${config.virtualJsonId}'

      export const messages = messageJson

      `
    } else if (ops.buildAssetRefId) {
      return 'export const messages = import.meta.ROLLUP_FILE_URL_${ops.buildAssetRefId}'
    } else {
      return `export const messages = ${JSON.stringify(config.devUrlPath || "/_virtual_locales.json")};`
    }
  }

  return {
    [imports]: "import { createI18n, useI18n } from 'vue-i18n';",
    [messages]: `${getMessages()}
     export const supportedLanguages = ${messagesCombined.languagesTuple()}
     export const fallbackLocales = ${JSON.stringify(messagesCombined.fallbackLocales)}`,
    // [supportedLanguages]: ``,
    // [fallbackLocales]: `export const fallbackLocales = ${JSON.stringify(messagesCombined.fallbackLocales)};`,
    [hrmHotUpdate]: codeHrmHotUpdate,
    [useI18nApp]: "export const useI18nApp = () => globalThis.i18nApp.global;",


    [translationWrapper]: translateWrapperFunction,
    [createI18nInstance]: codeCreateI18nInstance,
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
export type ToFileOptions = {
  /** Join string between sections (default: "\n\n") */
  separator?: string;
  /** Optional banner/header comment */
  banner?: string;
  /** Ensure directory exists (mkdir -p), default true */
  ensureDir?: boolean;
};


/** Typed, compact class with ergonomic helpers */
export class RuntimeMethods {
  private readonly _data: HelperMethodsRecord;

  constructor(ops: RuntimeGenerationParams, messagesCombined: CombinedMessages) {
    this._data = buildRuntimeMethods(ops, messagesCombined);
  }


  /** Deterministic full-file content (all sections in HelperMethodsOrder) */
  toFileContent(defaultExport: string = 'messages'): string {
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
    const resolved = this.parseSymbolEnumKey(target);

    const resolvedCode = resolved;//? this._data?.[resolved] : this._data?.[target];
    if (!resolvedCode) {
      // throw new Error(`getFileContentFor: No code found for target "${target}". Available keys: ${Object.keys(this._data).join(", ")}`);
      console.error(`getFileContentFor: No code found for target "${target}". Available keys: ${Object.entries(this._data).join(", ")}`);
      return this.toFileContent(target);
    }
    return [this._data[imports], resolvedCode, `export default ${target}`].join(separator);
  }
}
