/**
 * Options for the unplugin-vue-i18n-dts-generation Vite plugin.
 *
 * This plugin generates TypeScript definitions from JSON locale files,
 * providing type-safe i18n keys for your Vue application.
 */
export type VirtualKeysDtsOptions = {
  include?: string | string[];
  exclude?: string | string[];
  getLocaleFromPath?: (absFilePath: string, root: string) => string | null;
  merge?: "deep" | "shallow";
  transformJson?: (json: unknown, absFilePath: string) => unknown;
  devUrlPath?: string;
  emit?: {
    /**
     * Flag to inline locale data file in the build output.
     * @default false
     */
    inlineDataInBuild?: boolean;

    /**
     * Flag to emit the combined messages JSON file during build.
     * When enabled, writes messages.json alongside your bundle.
     * @default false
     */
    emitJson?: boolean;
  };
  debug?: boolean;

  /**
   * The virtual module ID for the generated locale module.
   * Usually you don't need to change this.
   * @default "virtual:unplug-i18n-dts-generation"
   */
  sourceId?: string

  /**
   * Path for the TypeScript type definitions file (.d.ts).
   *
   * @default "./src/vite-env-override.d.ts"
   * @example "src/types/i18n.types.d.ts"
   */
  typesPath?: string

  /**
   * Optional banner comment at the top of the generated file.
   */
  banner?: string

  /**
   * Base locale to use for generating TypeScript key paths.
   * The plugin will introspect this locale's messages to generate the type definitions.
   *
   * @default "de"
   */
  baseLocale?: string

  /**
   * Path for the virtual module file (.ts).
   * If specified, the virtual module will be generated as a physical file.
   * This can be useful for debugging or when you want to see the actual locale data.
   *
   * @default undefined (virtual module only served dynamically)
   * @example "src/i18n/i18n.virtual.gen.ts"
   */
  virtualFilePath?: string
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
  AllSupportedLanguages: string[]
  banner?: string
  sourceId?: string
}
