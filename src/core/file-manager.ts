import path from "node:path";
import {promises as fs} from "node:fs";


import type {CustomLogger, GenerationOptions, JSONValue} from "../types.ts";
import {toArray} from "../generation/runtime/merge.ts";
import {canonicalize} from "../utils/json.ts";
import {parseJSONWithLocation, wrapErrorWithFile} from "../utils/error-formatter.ts";
import {CombinedMessages} from "./combined-messages.ts";


export interface ParsedFile {
  localeKey: string;
  prepared: any;
}

/**
 * Manages file reading, caching, and incremental updates for locale files
 */
export class FileManager {
  private fileModTimes = new Map<string, number>();
  private parsedFilesCache = new Map<string, ParsedFile>();
  // private grouped:Record<string, any> = {};
  private lastFiles: string[] = [];

  constructor(private options: GenerationOptions) {

  }

  public async findFiles() {
    const allfiles = (await this.collectJsonFiles())

    this.options.logger.debug(`[FileManager] foundFiles:  ${allfiles.join(', ')}`);
    const filteredFiles = allfiles.filter(a => path.basename(a).match(/^(?=.*(?:^|\.)[a-z]{2}(?:-[A-Z]{2})?(?=\.|$)).*\.json$/)).filter(a => !a.startsWith("."));
    this.options.logger.info(`[FileManager] findFiles: total files found: ${allfiles.length}/${filteredFiles.length} after filtering`);

    this.lastFiles = filteredFiles;


  }

  public async processFile() {
    const abs = this.lastFiles.pop();
    if (abs) {
      this.options.logger.debug(`[FileManager] findFiles: file found: ${abs}`);
      await this.readFile(abs);
      return abs;
    }
    return null

  }

  /**
   * Collect JSON files using native Node.js glob or fast-glob fallback
   */
  async collectJsonFiles(): Promise<string[]> {
    const patterns = toArray(this.options.include);
    const ignore = toArray(this.options.exclude);

    const cwd = this.options.root;

    let start = performance.now();
    // const allImports = await import.meta.glob(this.options.root + '/**/*.json');

    // this.options.logger.debug(`[FileManager] collectJsonFiles: found ${Object.keys(allImports).length} JSON files via import.meta.glob in ${Math.round(performance.now() - start)}ms`);
    start = performance.now();

    // Node 22+: fs.promises.glob exists
    const fsAny = fs as unknown as {
      glob?: (pattern: string | readonly string[], options?: any) => AsyncIterable<string>;
    };

    async function fastGlob() {

      const {default: fg} = await import("../../node_modules/fast-glob");
      const list: string[] = await fg(patterns, {
        cwd,
        ignore,
        absolute: true,
        onlyFiles: true,
        dot: false
      });
      for (const p of list) entries.add(path.normalize(p));
      return entries;
    }

    async function nativeGlob() {
      const entries = new Set<string>();
      for (const pattern of patterns) {
        for await (const rel of fsAny.glob(pattern, {cwd, exclude: ignore})) {
          const abs = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
          entries.add(path.normalize(abs));
        }
      }
      return entries;
    }

    let entries = new Set<string>();
    if (typeof fsAny.glob === "function") {
      // Use native glob
      start = performance.now();
      entries = await nativeGlob();
      this.options.logger.debug(`[FileManager] collectJsonFiles: collected files via fs.promises.glob in ${Math.round(performance.now() - start)}ms`);
    } else {
      // Fallbasck: fast-glob
      start = performance.now();
      entries = await fastGlob();
      this.options.logger.debug(`[FileManager] collectJsonFiles: collected files via fast-glob in ${Math.round(performance.now() - start)}ms`);
    }

    const out = Array.from(entries);
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }


  /**
   * Read and group locale files with incremental updates
   */
  async readAndGroup() {
    const startReadGroup = performance.now();


    // Check which files need to be re-read (new or modified)


    const startFileRead = performance.now();
    await this.readChangedFiles();
    const fileReadDuration = Math.round(performance.now() - startFileRead);
    this.options.logger.debug(`[FileManager] readAndGroup: file read completed in ${fileReadDuration} ms `);
    // Merge all cached files (including unchanged ones)

    const totalDuration = Math.round(performance.now() - startReadGroup);

    this.options.logger.debug(`[FileManager] readAndGroup: merge completed in ${totalDuration}ms`);
    return {
      messages: new CombinedMessages(this.getGrouped(), this.options),
      stats: {

        durations: {
          stat: fileReadDuration,
          read: fileReadDuration,

          total: totalDuration,
        },
      },
    };
  }

  public getGrouped() {
    const grouped: Record<string, any> = {}
    for (const [_, {localeKey, prepared}] of this.parsedFilesCache) {
      if (!(localeKey in grouped)) grouped[localeKey] = {};
      grouped[localeKey] = this.options.mergeFunction(grouped[localeKey], prepared);
    }
    return canonicalize(grouped as JSONValue) as Record<string, any>;


  }

  /**
   * Read and parse changed files
   */
  public async readChangedFiles(): Promise<void> {
    while (this.lastFiles.length > 0) {
      await this.processFile();
    }
  }

  private async readFile(abs: string) {
    const localeKey = this.options.getLocaleFromPath(abs, this.options.root);

    if (!localeKey) {
      this.options.logger?.warn(`Skipping file with invalid locale: ${abs}`);
      return;
    }

    if (localeKey.length !== 2 && localeKey.length !== 5) {
      this.options.logger?.warn(`Uncommon locale: ${abs} -> ${localeKey}`);
    }

    try {
      const raw = await fs.readFile(abs, "utf8");

      // Parse JSON with enhanced error messages
      const parsed = parseJSONWithLocation(raw, abs);

      const prepared = this.options.transformJson
        ? this.options.transformJson(parsed, abs)
        : parsed;
      this.parsedFilesCache.set(abs, {localeKey, prepared});
    } catch (err: any) {
      // Wrap error with file context if not already formatted
      const formattedError = wrapErrorWithFile(abs, err);
      this.options.logger?.error(formattedError.message);
      throw formattedError;
    }
  }

  /**
   * Get list of last processed files
   */
  getLastFiles(): string[] {
    return this.lastFiles;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.fileModTimes.clear();
    this.parsedFilesCache.clear();
    this.lastFiles = [];
  }

  public async fileUpdated(filePath: string, readFile: () => string | Promise<string>, mtime: number): Promise<ParsedFile | undefined> {
    const localeKey = this.options.getLocaleFromPath(filePath, this.options.root);

    if (!localeKey) {
      this.options.logger?.warn(`Skipping file with invalid locale: ${filePath}`);
      return;
    }

    if (localeKey.length !== 2 && localeKey.length !== 5) {
      this.options.logger?.warn(`Uncommon locale: ${filePath} -> ${localeKey}`);
    }

    try {
      const raw = await readFile();

      // Parse JSON with enhanced error messages
      const parsed = parseJSONWithLocation(raw, filePath);

      const prepared = this.options.transformJson
        ? this.options.transformJson(parsed, filePath)
        : parsed;
      this.parsedFilesCache.set(filePath, {localeKey, prepared});
      this.fileModTimes.set(filePath, mtime);
      this.options.logger.debug(`File updated: ${filePath}`);
      return {localeKey, prepared};
    } catch (err: any) {
      // Wrap error with file context if not already formatted
      const formattedError = wrapErrorWithFile(filePath, err);
      this.options.logger?.error(formattedError.message);
      throw formattedError;
    }
  }


  public fileRemoved(filePath: string, readFile: () => (string | Promise<string>), mtime: number) {
    this.parsedFilesCache.delete(filePath);
    this.fileModTimes.delete(filePath);

  }

  public addNewFile(filePath: string, readFile: () => (string | Promise<string>), mtime: number) {
    return this.fileUpdated(filePath, readFile, mtime);

  }
}
