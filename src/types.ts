import {PluginOptions} from "@intlify/unplugin-vue-i18n";

/**
 * Options for the unplugin-vue-i18n-dts-generation Vite plugin.
 *
 * This plugin generates TypeScript definitions from unplugin-vue-i18n virtual modules,
 * providing type-safe i18n keys for your Vue application.
 */
export interface VirtualKeysDtsOptions {
  /**
   * Options to pass to the underlying unplugin-vue-i18n plugin.
   * @see https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n#-options
   */
  i18nPluginOptions?: PluginOptions,

  /**
   * The virtual module ID from unplugin-vue-i18n.
   * Default: "@intlify/unplugin-vue-i18n/messages"
   * Usually you don't need to change this.
   */
  sourceId?: string

  /**
   * Path for the TypeScript type definitions file (.d.ts).
   *
   * @default "src/i18n/i18n.types.d.ts"
   * @example "src/types/i18n.types.d.ts"
   */
  typesPath?: string

  /**
   * Path for the constants file (.ts) with runtime values.
   *
   * @default "src/i18n/i18n.consts.ts"
   * @example "src/types/i18n.consts.ts"
   */
  constsPath?: string


  /**
   * Optional banner comment at the top of the generated file.
   * If omitted, a deterministic banner without timestamps is emitted.
   */
  banner?: string

  /**
   * Whether to watch for changes and regenerate types automatically in development mode.
   *
   * @default true
   */
  watchInDev?: boolean

  /**
   * Base locale to use for generating TypeScript key paths.
   * The plugin will introspect this locale's messages to generate the type definitions.
   *
   * @default "en"
   */
  baseLocale?: string
}

/**
 * JSON types for message structure
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export interface JSONObject { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

/**
 * Parameters for generating TypeScript definition content
 * @internal
 */
export interface DtsContentParams<TMessages extends JSONValue = JSONValue> {
  messages: Record<string, TMessages>
  baseLocale: string
  typeFilePath: string
  supportedLanguages: string[]
  banner?: string
}
