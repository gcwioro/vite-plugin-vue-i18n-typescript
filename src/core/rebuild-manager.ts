import {DevEnvironment, EnvironmentModuleNode, Logger, ViteDevServer} from "vite";
import {FileManager} from "./file-manager";

import {CombinedMessages} from "./combined-messages";
import {GenerationOptions} from "../types.ts";


export interface RebuildManagerOptions {
  fileManager: FileManager;

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
  async rebuild(reason: string, buildAssetRefId?: string): Promise<{
    messages: CombinedMessages,


  }> {
    const startRebuild = performance.now();

    this.options.logger?.info(`🔄 Starting rebuild (${reason})...`);
    // Read and group files
    const {stats} = await this.options.fileManager.readAndGroup();

    // Canonicalize once and cache
    const startCanonical = performance.now();
    const grouped = this.options.fileManager.getGrouped();
    const messagesCached = new CombinedMessages(grouped, this.options.config)

    const canonicalDuration = Math.round(performance.now() - startCanonical);

    // Generate TypeScript definition files
    await messagesCached.writeFiles(buildAssetRefId);

    // Log generation stats
    // this.options.logger?.info(
    //   `📝 Generated files in ${generationResult.durations.total}ms (content: ${generationResult.durations.content}ms, write ${generationResult.filesWritten}/${generationResult.totalFiles} files: ${generationResult.durations.write}ms) | ${generationResult.filesList.join(', ')}`
    // );

    const totalRebuildDuration = Math.round(performance.now() - startRebuild);

    // Notify listeners
    this.options.onRebuildComplete?.({
      messages: messagesCached,
    });
    this.options.logger?.info(
      `✅ Rebuild complete (${reason}) in ${totalRebuildDuration}ms (canonicalize: ${canonicalDuration}ms) | Locales: ${messagesCached.languages.join(", ")}`
    );


    return {

      messages: messagesCached,
    };
  }

  public setEnv(environment: DevEnvironment) {
    this.environment = environment;
    this.options.logger?.info(`🔧 [RebuildManager] Environment set: ${environment.name}`);
  }
}
