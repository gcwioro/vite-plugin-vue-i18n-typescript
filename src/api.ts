import path from "node:path";
import type {GenerateTypesOptions, GenerateTypesResult} from "./types";
import {normalizeConfig} from "./core/config";
import {FileManager} from "./core/file-manager";

import {RebuildManager} from "./core/rebuild-manager";
import {createColoredLogger, createConsoleLogger} from "./createConsoleLogger";

import {CombinedMessages} from "./core/combined-messages.ts";

export {normalizeConfig, createColoredLogger, createConsoleLogger, CombinedMessages}


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
  const logger = createColoredLogger(options.debug ? "debug" : "info");
  const config = normalizeConfig({
    ...options,
    debug: debugEnabled
  }, logger);

  logger.info(`Starting type generation in: ${root}`);

  logger.info(`Base locale: ${config.baseLocale}`);
  logger.info(`Include patterns: ${config.include.join(", ")}`);
  logger.info(`Types output: ${config.typesPath}`);

  // Initialize core managers
  const fileManager = new FileManager(config);


  let lastFiles: string[] = [];

  const rebuildManager = new RebuildManager({
    config: config,
    fileManager,

    root,
    logger,
    onRebuildComplete: (_cache) => {
      lastFiles = fileManager.getLastFiles();
    },
  });

  // Perform generation
  const result = await rebuildManager.rebuild("api");

  lastFiles = fileManager.getLastFiles();

  const locales = result.messages.languages.filter((l: string) => l !== "js-reserved");

  logger.info(`✅ Generated types for ${locales.length} locale(s): ${locales.join(", ")}`);
  logger.info(`📁 Processed ${lastFiles.length} locale file(s)`);

  // Get generation details
  const typesPath = path.isAbsolute(config.typesPath)
    ? config.typesPath
    : path.join(root, config.typesPath);

  const generatedFiles = [path.relative(root, typesPath).replace(/\\/g, '/')];
  if (config.virtualFilePath) {
    const virtualPath = path.isAbsolute(config.virtualFilePath)
      ? config.virtualFilePath
      : path.join(root, config.virtualFilePath);
    generatedFiles.push(path.relative(root, virtualPath).replace(/\\/g, '/'));
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
