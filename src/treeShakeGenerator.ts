// HelperMethods.ts
import {CombinedMessages} from "./core/combined-messages";
import {GenerationOptions} from "./core/generation-coordinator";

import translateWrapperFunction from "./generation/runtime/translateWrapperFunction.ts??inline";

/** String enum keeps runtime minimal and DX straightforward */
export enum SymbolEnum {
  imports = "_imports",
  messages = "messages",
  hrmHotUpdate = "_hrmHotUpdate",

  useI18nApp = "useI18nApp",
  supportedLanguages = "supportedLanguages",
  fallBackLocales = "fallBackLocales",
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
export const fallBackLocales = SymbolEnum.fallBackLocales;
export const translationWrapper = SymbolEnum.translationWrapper;
export const createI18nInstance = SymbolEnum.createI18nInstance;
export const createI18nInstancePlugin = SymbolEnum.createI18nInstancePlugin;
export const useI18nTypeSafe = SymbolEnum.useI18nTypeSafe;


import deepMerge from './utils/merge.ts??inline';
import hotUpdateCallback from "./generation/runtime/hrmHotUpdate.ts??raw";

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
  [supportedLanguages.toString()]: SymbolEnum.supportedLanguages,
  fallBackLocales: SymbolEnum.fallBackLocales,
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
    [messages]: getMessages(),
    [hrmHotUpdate]: codeHrmHotUpdate,
    [useI18nApp]: "export const useI18nApp = () => globalThis.i18nApp.global;",

    [supportedLanguages]:
      `export const supportedLanguages = ${messagesCombined.languagesTuple()}`,
    [fallBackLocales]:
      `export const fallBackLocales = supportedLanguages.reduce((acc, locale) => {
  acc[locale] = [locale, locale === 'en' ? undefined : 'en', locale === 'de' ? undefined : 'de'].filter(a => a !== undefined);
  if (locale === 'en') acc[locale] = [...acc[locale], 'en-US'];
  return acc;
}, {});`,
    [translationWrapper]: translateWrapperFunction,
    [createI18nInstance]:
      `export function createI18nInstance(options) {
  const i18Options = {
    fallbackLocale: fallBackLocales,
    // missingWarn: false,
    // fallbackWarn: false,
    locale: navigator?.language ?? '${config.baseLocale}',
    legacy: false,
    ...options,
    messages: messages,
  };
  const i18nApp = createI18n(i18Options);
  globalThis.i18nApp = i18nApp;
  // i18nApp.global.locale = navigator?.language?.split("-")?.[0] ?? '${config.baseLocale}';
  return i18nApp;
}`,
    [createI18nInstancePlugin]:
      `export function createI18nInstancePlugin(options) {
  const i18n = createI18nInstance(options);
  return i18n;
}`,
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
