import path from "node:path";
import {promises as fs} from "node:fs";
import type {Logger} from "vite";
import {toArray} from "../utils";
import {parseJSONWithLocation, wrapErrorWithFile} from "../utils/error-formatter";

export interface FileManagerOptions {
  include: string | string[];
  exclude: string | string[];
  root: string;
  getLocaleFromPath: (absPath: string, root: string) => string | null;
  transformJson?: (json: unknown, absPath: string) => unknown;
  merge: (a: any, b: any) => any;
  logger?: Logger;
  debug?: boolean;
}

interface ParsedFile {
  localeKey: string;
  prepared: any;
}

/**
 * Manages file reading, caching, and incremental updates for locale files
 */
export class FileManager {
  private fileModTimes = new Map<string, number>();
  private parsedFilesCache = new Map<string, ParsedFile>();
  private lastFiles: string[] = [];

  constructor(private options: FileManagerOptions) {
  }

  /**
   * Collect JSON files using native Node.js glob or fast-glob fallback
   */
  async collectJsonFiles(): Promise<string[]> {
    const patterns = toArray(this.options.include);
    const ignore = toArray(this.options.exclude);
    const entries = new Set<string>();
    const cwd = this.options.root;

    // Node 22+: fs.promises.glob exists
    const fsAny = fs as unknown as {
      glob?: (pattern: string | readonly string[], options?: any) => AsyncIterable<string>;
    };

    if (typeof fsAny.glob === "function") {
      // Use native glob
      for (const pattern of patterns) {
        for await (const rel of fsAny.glob(pattern, {cwd, exclude: ignore})) {
          const abs = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
          entries.add(path.normalize(abs));
        }
      }
    } else {
      // Fallback: fast-glob
      const {default: fg} = await import("fast-glob");
      const list: string[] = await fg(patterns, {
        cwd,
        ignore,
        absolute: true,
        onlyFiles: true,
        dot: false
      });
      for (const p of list) entries.add(path.normalize(p));
    }

    const out = Array.from(entries);
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }

  /**
   * Read and group locale files with incremental updates
   */
  async readAndGroup(): Promise<{
    grouped: Record<string, any>;
    stats: {
      totalFiles: number;
      filesRead: number;
      durations: {
        stat: number;
        read: number;
        merge: number;
        total: number;
      };
    };
  }> {
    const startReadGroup = performance.now();
    const files = await this.collectJsonFiles();
    this.lastFiles = files;
    const grouped: Record<string, any> = {};

    // Check which files need to be re-read (new or modified)
    const filesToRead: string[] = [];
    const startStatCheck = performance.now();
    const fileStats = await Promise.all(
      files.map(async (f) => {
        try {
          const stat = await fs.stat(f);
          return {path: f, mtime: stat.mtimeMs};
        } catch {
          return {path: f, mtime: 0};
        }
      })
    );
    const statCheckDuration = Math.round(performance.now() - startStatCheck);

    for (const {path: abs, mtime} of fileStats) {
      const cachedMtime = this.fileModTimes.get(abs);
      if (cachedMtime === undefined || mtime !== cachedMtime) {
        filesToRead.push(abs);
        this.fileModTimes.set(abs, mtime);
      }
    }

    // Remove entries for files that no longer exist
    const currentFiles = new Set(files);
    for (const [cachedPath] of this.fileModTimes) {
      if (!currentFiles.has(cachedPath)) {
        this.fileModTimes.delete(cachedPath);
        this.parsedFilesCache.delete(cachedPath);
      }
    }

    // Read only changed/new files
    const startFileRead = performance.now();
    await this.readChangedFiles(filesToRead);
    const fileReadDuration = Math.round(performance.now() - startFileRead);

    // Merge all cached files (including unchanged ones)
    const startMerge = performance.now();
    for (const [_, {localeKey, prepared}] of this.parsedFilesCache) {
      if (!(localeKey in grouped)) grouped[localeKey] = {};
      grouped[localeKey] = this.options.merge(grouped[localeKey], prepared);
    }
    const mergeDuration = Math.round(performance.now() - startMerge);

    const totalDuration = Math.round(performance.now() - startReadGroup);

    return {
      grouped,
      stats: {
        totalFiles: files.length,
        filesRead: filesToRead.length,
        durations: {
          stat: statCheckDuration,
          read: fileReadDuration,
          merge: mergeDuration,
          total: totalDuration,
        },
      },
    };
  }

  /**
   * Read and parse changed files
   */
  private async readChangedFiles(filesToRead: string[]): Promise<void> {
    for (const abs of filesToRead) {
      const localeKey = this.options.getLocaleFromPath(abs, this.options.root);

      if (!localeKey) {
        this.options.logger?.warn(`Skipping file with invalid locale: ${abs}`);
        continue;
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
}
