import type {createColoredLogger} from "./api.ts";
import './vite-env-override-components.ts'

/**
 * Options for the plugin.
 *
 * This plugin generates TypeScript definitions from JSON locale files,
 * providing type-safe i18n keys for your Vue application.
 */
export interface VirtualKeysDtsOptions {
  root?: string;

  /*
  * Number of files to process in each batch.
  * @default 100
   */
  fileBatchSize?: number;
  include?: string | string[];
  exclude?: string | string[];
  getLocaleFromPath?: (absFilePath: string, root: string) => string | null;
  merge?: "deep" | "shallow";
  transformJson?: (json: unknown, absFilePath: string) => unknown;
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


export type CustomLogger = ReturnType<typeof createColoredLogger>;


/**
 * Options for standalone type generation
 */
export interface GenerateTypesOptions extends VirtualKeysDtsOptions {
  /**
   * Root directory for the project (defaults to current working directory)
   */
  root?: string;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

/**
 * Result of type generation
 */
export interface GenerateTypesResult {
  /**
   * Number of files written
   */
  filesWritten: number;

  /**
   * Total files that were checked
   */
  totalFiles: number;

  /**
   * List of generated file paths (relative to root)
   */
  generatedFiles: string[];

  /**
   * Performance metrics
   */
  durations: {
    content: number;
    write: number;
    total: number;
  };

  /**
   * Detected locales
   */
  locales: string[];

  /**
   * Number of locale files processed
   */
  localeFilesCount: number;

  /**
   * Absolute paths of all locale files that were processed
   */
  localeFiles: string[];
}

export interface GenerationOptions extends Omit<VirtualKeysDtsOptions, 'exclude' | 'extends'> {

  root: string;
  sourceId: string;
  typesPath: string;
  getLocaleFromPath: (absPath: string, root: string) => string | null;
  baseLocale: string;

  merge: "deep" | "shallow";

  virtualFilePath?: string,

  mergeFunction: (a: any, b: any) => any;
  include: string[];
  exclude: string[];
  debug: boolean;
  transformJson?: (json: unknown, absPath: string) => unknown;
  verbose: boolean;
  logger: CustomLogger,
}

import './vite-env-override-components.ts'
