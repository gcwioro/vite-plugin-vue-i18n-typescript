import path from "node:path";
import {promises as fs} from "node:fs";


import type {GenerationOptions, JSONValue} from "../types.ts";
import {toArray} from "../generation/runtime/merge.ts";
import {canonicalize, detectKeyConflicts} from "../utils/json.ts";
import {parseJSONWithLocation, wrapErrorWithFile} from "../utils/error-formatter.ts";
import {CombinedMessages} from "./combined-messages.ts";

type FilesProcesedCallback = (files: CombinedMessages, change?: string[]) => void | Promise<void>;
type FileUpdatedCallback = (file: ParsedFile) => (void | Promise<void>)

export interface ParsedFile {
  localeKey: string;
  prepared: any;
}

/**
 * Manages file reading, caching, and incremental updates for locale files
 */
export class FileManager {
  private parsedFilesCache = new Map<string, ParsedFile>();
  // private grouped:Record<string, any> = {};
  private processedFiles: Set<string> = new Set<string>();
  public filesToProcess: Set<string> = new Set<string>();

  constructor(private options: GenerationOptions) {

  }

  public async findFiles() {
    const allfiles = (await this.collectJsonFiles())


    this.filesToProcess = new Set(allfiles);


  }

  public async processFile(file?: string) {
    file ??= this.filesToProcess.values().next().value;
    if (file) {

      await this.readFile(file);


      return file;
    }
    return null

  }

  private async fastGlob() {
    const patterns = toArray(this.options.include);
    // Remove the '!' prefix from exclude patterns since fast-glob's ignore option doesn't use it
    const ignore = toArray(this.options.exclude).map(p => p.startsWith('!') ? p.slice(1) : p);

    const cwd = this.options.root;
    const start = performance.now();
    const {default: fg} = await import("fast-glob");
    const list: string[] = await fg(patterns, {
      cwd,
      ignore,
      absolute: true,
      onlyFiles: true,
      dot: false
    });


    const entries = list.map(p => path.normalize(p));
    this.options.logger.info(`[FileManager] [findFiles] fast-glob: found ${entries.length} files in ${Math.round(performance.now() - start)}ms`);
    return entries;
  }

  /**
   * Collect JSON files using native Node.js glob or fast-glob fallback
   */
  async collectJsonFiles(): Promise<string[]> {
    const patterns = toArray(this.options.include);
    // Remove the '!' prefix from exclude patterns since fast-glob's ignore option doesn't use it
    const ignore = toArray(this.options.exclude).map(p => p.startsWith('!') ? p.slice(1) : p);

    const cwd = this.options.root;

    this.options.logger.debug(`[FileManager] collectJsonFiles: patterns=${patterns.join(', ')}`);
    this.options.logger.debug(`[FileManager] collectJsonFiles: cwd=${cwd}`);
    this.options.logger.debug(`[FileManager] collectJsonFiles: ignore=${ignore.join(', ')}`);

    let start = performance.now();
    // const allImports = await import.meta.glob(this.options.root + '/**/*.json');

    // this.options.logger.debug(`[FileManager] collectJsonFiles: found ${Object.keys(allImports).length} JSON files via import.meta.glob in ${Math.round(performance.now() - start)}ms`);
    start = performance.now();


    const nativeGlobEntriess = [];//nativeGlob();

    const fastGlobEntries = this.fastGlob();
    const entries = new Set<string>([...(await fastGlobEntries)]);    // Fallbasck: fast-glob


    const out = Array.from(entries);

    this.options.logger.debug(`[FileManager] foundFiles:  ${out.slice(0, Math.min(out.length, 10)).join(', ')}`);
    const filteredFiles = out;
    this.options.logger.info(`[FileManager] findFiles: total files found: ${out.length}/${filteredFiles.length} after filtering`);


    filteredFiles.sort((a, b) => a.localeCompare(b));
    return filteredFiles;
  }


  /**
   * Read and group locale files with incremental updates
   */
  async readAndGroup() {
    const startReadGroup = performance.now();

    // Find all locale files first
    if (this.filesToProcess.size === 0)

      await this.findFiles();

    const files = this.filesToProcess
    // Check which files need to be re-read (new or modified)


    const startFileRead = performance.now();
    await this.readChangedFiles();

    // Merge all cached files (including unchanged ones)

    const totalDuration = Math.round(performance.now() - startReadGroup);

    this.options.logger.info(`[FileManager] reading ${this.processedFiles.size} files completed in ${totalDuration}ms`);
    const combinedMessages = await this.buildMessagesAndNotify(files);
    return {
      messages: combinedMessages,
      stats: {

        durations: {
          stat: totalDuration,
          read: totalDuration,

          total: totalDuration,
        },
      },
    };
  }

  private async buildMessagesAndNotify(files: Set<string> | string[]) {
    const combinedMessages = new CombinedMessages(this.getGrouped(), this.options);
    await Promise.all(this.callbacks.map(cb => cb(combinedMessages, [...files])));
    return combinedMessages;
  }

  public getGrouped(files?: Map<string, ParsedFile>) {
    const grouped: Record<string, any> = {}
    files ??= this.parsedFilesCache;
    for (const [_, {localeKey, prepared}] of files) {
      if (!(localeKey in grouped)) grouped[localeKey] = {};
      grouped[localeKey] = this.options.mergeFunction(grouped[localeKey], prepared);
    }
    return canonicalize(grouped as JSONValue) as Record<string, any>;


  }

  /**
   * Read and parse changed files
   */
  public async readChangedFiles(): Promise<void> {
    let readFiles = 0;
    const filesToProcess = new Set([...this.filesToProcess])
    const totalFiles = filesToProcess.size;
    const start = performance.now();
    while (filesToProcess.size > 0) {
      const readFileBatches = this.options.fileBatchSize ?? 100;
      const filesToProcessInRound = [...filesToProcess].slice(0, Math.min(readFileBatches, filesToProcess.size));
      this.options.logger.debug(`[FileManager] readChangedFiles: processing batch of ${readFiles} / ${totalFiles} files. | Elapsed: ${Math.round(performance.now() - start)}ms`);
      const tasks = filesToProcessInRound
        .map(a => this.processFile(a))
      filesToProcessInRound.forEach(a => filesToProcess.delete(a));
      await Promise.all(tasks);
      filesToProcessInRound.forEach(file => this.filesToProcess.delete(file))
      filesToProcessInRound.forEach(file => this.processedFiles.add(file))

      readFiles += filesToProcessInRound.length;

    }
  }

  private async readFile(abs: string, readFileContent?: () => string | Promise<string>, localeKey: string | null = null) {
    localeKey ??= this.options.getLocaleFromPath(abs, this.options.root);


    if (!localeKey) {
      this.options.logger?.warn(`Skipping file with invalid locale: ${abs}`);
      return;
    }

    if (localeKey.length !== 2 && localeKey.length !== 5) {
      this.options.logger?.warn(`Uncommon locale: ${abs} -> ${localeKey}`);
    }

    try {
      readFileContent ??= () => fs.readFile(abs, "utf8");
      const raw = await readFileContent();

      // Parse JSON with enhanced error messages
      const parsed = parseJSONWithLocation(raw, abs);

      const prepared = this.options.transformJson
        ? this.options.transformJson(parsed, abs)
        : parsed;
      this.parsedFilesCache.set(abs, {localeKey, prepared});
      return {localeKey, prepared} as ParsedFile;
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
    return [...this.processedFiles];
  }

  /**
   * Clear all caches
   */
  clearCache(): void {

    this.parsedFilesCache.clear();
    this.processedFiles = new Set<string>();
    this.filesToProcess = new Set<string>();
  }

  public async fileUpdated(filePath: string, readFile?: () => string | Promise<string>, locale: string | null = null): Promise<ParsedFile | undefined> {
    // let newVar = await this.readFile(filePath, readFile, locale);
    // if (newVar) {
    //   await Promise.all(this.callbacksFileChanged.map(async a => await a(newVar)));
    // }
    // return newVar;

    this.parsedFilesCache.delete(filePath);
    this.filesToProcess.add(filePath);
    const newVar = await this.readFile(filePath);
    if (newVar) {
      // this.callbacksFileChanged.map(async a => await a(newVar));
    }
    await this.buildMessagesAndNotify([filePath]);
    return newVar;


  }

  public fileUpdatedWithLocale(filePath: string, locale: string): Promise<ParsedFile | undefined> {
    return this.fileUpdated(filePath, undefined, locale);


  }

  public validateMessages(): Promise<string[]> {
    return new Promise((resolve) => {

      const conflicts = detectKeyConflicts(this.getGrouped());
      if (conflicts.length > 0) {
        this.options.logger.error('⚠️  Conflicting translation keys detected:', {
          timestamp: true,
        });
        for (const conflict of conflicts) {
          this.options.logger.error(`   ${conflict}`, {timestamp: true});
        }
      }
      resolve(conflicts);

    })
  }

  public async fileRemoved(filePath: string) {
    this.parsedFilesCache.delete(filePath);
    await this.buildMessagesAndNotify([filePath]);
  }

  public addNewFile(filePath: string, readFile: () => (string | Promise<string>), mtime: number) {
    return this.fileUpdated(filePath, readFile);

  }

  public callbacksFileChanged: Array<FileUpdatedCallback> = [];
  private callbacks: Array<FilesProcesedCallback> = [];

  public addOnAllFilesProcessed(callback: FilesProcesedCallback) {
    this.callbacks.push(callback);
  }

  public addOnFileChanged(callback: FileUpdatedCallback) {
    this.callbacksFileChanged.push(callback);
  }
}
