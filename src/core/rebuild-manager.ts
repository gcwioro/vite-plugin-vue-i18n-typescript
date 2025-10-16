import type {Logger, ViteDevServer} from "vite";
import {canonicalize} from "../utils";
import type {JSONValue} from "../types";
import {FileManager} from "./file-manager";
import {GenerationCoordinator} from "./generation-coordinator";

const DEBOUNCE_MS = 300;
const MAX_WAIT_MS = 2000;

export interface RebuildManagerOptions {
  fileManager: FileManager;
  generationCoordinator: GenerationCoordinator;
  root: string;
  logger?: Logger;
  onRebuildComplete?: (cache: {
    grouped: Record<string, any>;
    jsonText: string;
  }) => void;
}

/**
 * Manages rebuild process with debouncing and hot module invalidation
 */
export class RebuildManager {
  private rebuildTimer?: ReturnType<typeof setTimeout>;
  private lastRebuildCall = 0;
  private serverRef?: ViteDevServer;
  private resolvedVirtualId?: string;

  constructor(private options: RebuildManagerOptions) {
  }

  /**
   * Set the Vite dev server reference for hot updates
   */
  setServer(server: ViteDevServer, resolvedVirtualId: string): void {
    this.serverRef = server;
    this.resolvedVirtualId = resolvedVirtualId;
  }

  /**
   * Perform debounced rebuild
   */
  async debouncedRebuild(reason: string): Promise<void> {
    const now = Date.now();
    if (!this.lastRebuildCall) this.lastRebuildCall = now;

    if (this.rebuildTimer) clearTimeout(this.rebuildTimer);

    // If we've been waiting too long, rebuild immediately
    if (now - this.lastRebuildCall >= MAX_WAIT_MS) {
      this.lastRebuildCall = 0;
      await this.rebuild(reason);
      return;
    }

    // Otherwise, schedule a debounced rebuild
    return new Promise<void>((resolve) => {
      this.rebuildTimer = setTimeout(async () => {
        this.lastRebuildCall = 0;
        await this.rebuild(reason);
        resolve();
      }, DEBOUNCE_MS);
    });
  }

  /**
   * Perform full rebuild
   */
  async rebuild(reason: string): Promise<{
    grouped: Record<string, any>;
    jsonText: string;
  }> {
    const startRebuild = performance.now();

    // Read and group files
    const {grouped, stats} = await this.options.fileManager.readAndGroup();

    // Log file reading stats
    if (stats.filesRead > 0 || this.options.logger) {
      this.options.logger?.info(
        `📖 Read & Group: ${stats.durations.total}ms (stat: ${stats.durations.stat}ms, read ${stats.filesRead}/${stats.totalFiles} files: ${stats.durations.read}ms, merge: ${stats.durations.merge}ms)`
      );
    }

    // Canonicalize once and cache
    const startCanonical = performance.now();
    const groupedCache = canonicalize(grouped as JSONValue) as Record<string, any>;
    const jsonTextCache = JSON.stringify(groupedCache);
    const canonicalDuration = Math.round(performance.now() - startCanonical);

    // Generate TypeScript definition files
    const generationResult = await this.options.generationCoordinator.generateFiles(
      groupedCache,
      this.options.root
    );

    // Log generation stats
    this.options.logger?.info(
      `📝 Generated files in ${generationResult.durations.total}ms (content: ${generationResult.durations.content}ms, write ${generationResult.filesWritten}/${generationResult.totalFiles} files: ${generationResult.durations.write}ms) | ${generationResult.filesList.join(', ')}`
    );

    const totalRebuildDuration = Math.round(performance.now() - startRebuild);
    this.options.logger?.info(
      `✅ Rebuild complete (${reason}) in ${totalRebuildDuration}ms (canonicalize: ${canonicalDuration}ms) | Locales: ${Object.keys(groupedCache).join(", ")}`
    );

    // Invalidate hot module
    await this.invalidateModule();

    // Notify listeners
    this.options.onRebuildComplete?.({
      grouped: groupedCache,
      jsonText: jsonTextCache,
    });

    return {
      grouped: groupedCache,
      jsonText: jsonTextCache,
    };
  }

  /**
   * Invalidate virtual module and trigger hot reload
   */
  private async invalidateModule(): Promise<void> {
    if (!this.serverRef || !this.resolvedVirtualId) return;

    const mod = this.serverRef.moduleGraph.getModuleById(this.resolvedVirtualId);
    if (mod) {
      await this.serverRef.moduleGraph.invalidateModule(mod);
      this.serverRef.ws.send({
        type: "full-reload",
        path: "*",
      });
    }
  }
}
