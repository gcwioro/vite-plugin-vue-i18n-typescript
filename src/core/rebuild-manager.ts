import {DevEnvironment, EnvironmentModuleNode, Logger, ViteDevServer} from "vite";
import {canonicalize} from "../utils";
import type {JSONValue} from "../types";
import {FileManager} from "./file-manager";
import {GenerationCoordinator, GenerationOptions} from "./generation-coordinator";
import {CombinedMessages} from "./combined-messages";


export interface RebuildManagerOptions {
  fileManager: FileManager;
  generationCoordinator: GenerationCoordinator;
  root: string;
  config: GenerationOptions,
  logger?: Logger;
  onRebuildComplete?: (cache: {
    modules?: EnvironmentModuleNode[];
    messages: CombinedMessages
  }) => void;
}

/**
 * Manages rebuild process with debouncing and hot module invalidation
 */
export class RebuildManager {
  private rebuildTimer?: ReturnType<typeof setTimeout>;
  private lastRebuildCall = 0;
  private serverRef?: ViteDevServer;

  private environment?: DevEnvironment;

  constructor(private options: RebuildManagerOptions) {
  }

  /**
   * Set the Vite dev server reference for hot updates
   */
  setServer(server: ViteDevServer): void {
    this.serverRef = server;

    this.options.logger?.info(`🔧 [RebuildManager] Server reference set. Virtual ID: ${this.options.config.sourceId}`);
  }

  /**
   * Perform full rebuild
   */
  async rebuild(reason: string, modules: EnvironmentModuleNode[]): Promise<{
    messages: CombinedMessages,

    modules: EnvironmentModuleNode[];
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
    const messagesCached = new CombinedMessages(groupedCache, this.options.config.baseLocale)
    // const jsonTextCache = JSON.stringify(groupedCache);
    const canonicalDuration = Math.round(performance.now() - startCanonical);

    // Generate TypeScript definition files
    const generationResult = await this.options.generationCoordinator.generateFiles(
      messagesCached,
      this.options.root
    );

    // Log generation stats
    this.options.logger?.info(
      `📝 Generated files in ${generationResult.durations.total}ms (content: ${generationResult.durations.content}ms, write ${generationResult.filesWritten}/${generationResult.totalFiles} files: ${generationResult.durations.write}ms) | ${generationResult.filesList.join(', ')}`
    );

    const totalRebuildDuration = Math.round(performance.now() - startRebuild);

    // Invalidate hot module
    const modulesResult = modules;

    // Notify listeners
    this.options.onRebuildComplete?.({
      messages: messagesCached,
      modules: modulesResult,

    });
    this.options.logger?.info(
      `✅ Rebuild complete (${reason}) in ${totalRebuildDuration}ms (canonicalize: ${canonicalDuration}ms) | Locales: ${Object.keys(groupedCache).join(", ")}`
    );


    return {
      modules: modulesResult ?? [],
      messages: messagesCached,
    };
  }

  public setEnv(environment: DevEnvironment) {
    this.environment = environment;
    this.options.logger?.info(`🔧 [RebuildManager] Environment set: ${environment.name}`);
  }
}
