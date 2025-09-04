import {PluginOptions} from "@intlify/unplugin-vue-i18n";

/**
 * Options for the virtual keys DTS generator.
 */
export interface VirtualKeysDtsOptions {



  // Options to pass to unplugin-vue-i18n.
  // Default: "{sources: [ path.resolve(__dirname, './src/**/[a - z][a - z].{json, json5, ts, yaml}'), path.resolve(__dirname, './src/**/*-[a-z][a-z].{json,json5,ts,yaml}'), path.resolve(__dirname, './src/**/[a-z][a-z]-*.{json,json5,ts,yaml}') ]}"
  // See: https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n#-options
  i18nPluginOptions?: PluginOptions,
  /**
   * The virtual module ID from unplugin-vue-i18n.
   * Default: "@intlify/unplugin-vue-i18n/messages"
   * Usually you don't need to change this.
   */
  sourceId?: string



  /**
   * Absolute or relative path (from Vite root) where the generated .d.ts file should be written.
   * Example: "src/types/i18n.d.ts"
   * Default: "src/types/i18n.d.ts"
   */
  dtsPath?: string

  /**
   * Name for the generated union type. (Kept for compatibility; not strictly needed.)
   * Default: "VirtualKey"
   */
  typeName?: string

  /**
   * Optional banner comment at the top of the generated file.
   * If omitted, a deterministic banner without timestamps is emitted.
   */
  banner?: string

  /**
   * If true, the plugin will re-generate on every relevant file change in dev.
   * Default: true
   */
  watchInDev?: boolean

  /**
   * Optional function to post-process the keys (e.g., sort, filter, dedupe).
   * Default: sort ascending, unique.
   */
  transformKeys?: (keys: string[]) => string[]

  /**
   * Base locale to introspect for key-path generation.
   * Default: "en"
   */
  baseLocale?: string
}

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export interface JSONObject { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

export interface DtsContentParams {
  messagesForBaseLocale: JSONObject
  supportedLanguages: string[]
  banner?: string
  transformKeys?: (keys: string[]) => string[]
  typeName?: string
}
