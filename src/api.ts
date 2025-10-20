import path from "node:path";
import type {Logger} from "vite";
import type {VirtualKeysDtsOptions} from "./types";
import {normalizeConfig} from "./core/config";
import {FileManager} from "./core/file-manager";
import {GenerationCoordinator} from "./core/generation-coordinator";
import {RebuildManager} from "./core/rebuild-manager";

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

/**
 * Create a simple console logger compatible with Vite's Logger interface
 */
function createLogger(debugEnabled: boolean = false): Logger {
  const warnedMessages = new Set<string>();

  return {
    info: (msg: string) => {
      if (debugEnabled) {
        console.log(`[vue-i18n-dts] ${msg}`);
      }
    },
    warn: (msg: string) => {
      console.warn(`[vue-i18n-dts] ${msg}`);
    },
    error: (msg: string) => {
      console.error(`[vue-i18n-dts] ${msg}`);
    },
    warnOnce: (msg: string) => {
      if (!warnedMessages.has(msg)) {
        warnedMessages.add(msg);
        console.warn(`[vue-i18n-dts] ${msg}`);
      }
    },
    clearScreen: () => {
    },
    hasErrorLogged: () => false,
    hasWarned: false,
  };
}

/**
 * Generate TypeScript definitions from Vue i18n locale files
 *
 * @param options - Configuration options for generation
 * @returns Promise with generation result
 *
 * @example
 * ```typescript
 * import { generateI18nTypes } from 'unplugin-vue-i18n-dts-generation/api'
 *
 * const result = await generateI18nTypes({
 *   baseLocale: 'en',
 *   include: ['src/locales/*.json'],
 *   typesPath: 'src/i18n/i18n.gen.d.ts',
 *   verbose: true
 * })
 *
 * console.log(`Generated ${result.filesWritten} files for ${result.locales.length} locales`)
 * ```
 */
export async function generateI18nTypes(
  options: GenerateTypesOptions = {}
): Promise<GenerateTypesResult> {
  const root = options.root ? path.resolve(options.root) : process.cwd();
  const debugEnabled = options.debug ?? options.verbose ?? false;
  const config = normalizeConfig({
    ...options,
    debug: debugEnabled,
  });
  const logger = createLogger(config.debug);

  logger.info(`Starting type generation in: ${root}`);

  logger.info(`Base locale: ${config.baseLocale}`);
  logger.info(`Include patterns: ${config.include.join(", ")}`);
  logger.info(`Types output: ${config.typesPath}`);

  // Initialize core managers
  const fileManager = new FileManager({
    include: config.include,
    exclude: config.exclude,
    root,
    getLocaleFromPath: config.getLocaleFromPath,
    transformJson: config.transformJson,
    merge: config.mergeFunction,
    logger,
    debug: config.debug,
  });

  const generationCoordinator = new GenerationCoordinator({
    typesPath: config.typesPath,
    virtualFilePath: config.virtualFilePath,
    baseLocale: config.baseLocale,
    banner: config.banner,
    sourceId: config.sourceId,
    logger,
  });

  let groupedCache: Record<string, any> = {};
  let lastFiles: string[] = [];

  const rebuildManager = new RebuildManager({
    fileManager,
    generationCoordinator,
    root,
    logger,
    onRebuildComplete: (cache) => {
      groupedCache = cache.grouped;
      lastFiles = fileManager.getLastFiles();
    },
  });

  // Perform generation
  const result = await rebuildManager.rebuild("api", []);

  groupedCache = result.grouped;
  lastFiles = fileManager.getLastFiles();

  const locales = Object.keys(groupedCache).filter((l) => l !== "js-reserved");

  logger.info(`✅ Generated types for ${locales.length} locale(s): ${locales.join(", ")}`);
  logger.info(`📁 Processed ${lastFiles.length} locale file(s)`);

  // Get generation details
  const typesPath = path.isAbsolute(config.typesPath)
    ? config.typesPath
    : path.join(root, config.typesPath);

  const generatedFiles = [path.relative(root, typesPath)];
  if (config.virtualFilePath) {
    const virtualPath = path.isAbsolute(config.virtualFilePath)
      ? config.virtualFilePath
      : path.join(root, config.virtualFilePath);
    generatedFiles.push(path.relative(root, virtualPath));
  }

  return {
    filesWritten: generatedFiles.length,
    totalFiles: generatedFiles.length,
    generatedFiles,
    durations: {
      content: 0, // Will be populated by generation coordinator
      write: 0,
      total: 0,
    },
    locales,
    localeFilesCount: lastFiles.length,
    localeFiles: lastFiles,
  };
}
