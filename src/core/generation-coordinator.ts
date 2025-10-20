import path from "node:path";
import {promises as fs} from "node:fs";
import type {Logger} from "vite";
import {detectKeyConflicts, ensureDir, writeFileAtomic} from "../utils";
import {toTypesContent, toVirtualModuleContent} from "../generator";
import type {JSONObject, JSONValue} from "../types";
import {CombinedMessages} from "./combined-messages";
import {NormalizedConfig} from "./config";

export interface GenerationOptions extends NormalizedConfig {
  logger: Logger;
}

interface GenerationResult {
  filesWritten: number;
  totalFiles: number;
  durations: {
    content: number;
    write: number;
    total: number;
  };
  filesList: string[];
}

/**
 * Coordinates the generation of TypeScript definition files
 */
export class GenerationCoordinator {
  constructor(private options: GenerationOptions) {
  }

  /**
   * Generate type definition and virtual module files
   */
  async generateFiles(
    messages: CombinedMessages,
    rootDir: string
  ): Promise<GenerationResult> {
    const start = performance.now();

    // Create CombinedMessages instance


    // Resolve output paths
    const typesOutPath = path.isAbsolute(this.options.typesPath)
      ? this.options.typesPath
      : path.join(rootDir, this.options.typesPath);

    const virtualOutPath = this.options.virtualFilePath
      ? path.isAbsolute(this.options.virtualFilePath)
        ? this.options.virtualFilePath
        : path.join(rootDir, this.options.virtualFilePath)
      : undefined;

    // Validate and generate content
    const startContentGen = performance.now();
    this.validateMessages(messages.messages);
    const {typesContent, virtualContent} = await this.generateContent(messages);
    const contentGenDuration = Math.round(performance.now() - startContentGen);

    // Write files
    const startWrite = performance.now();
    const filesWritten = await this.writeFiles(typesOutPath, virtualOutPath, typesContent, virtualContent);
    const writeDuration = Math.round(performance.now() - startWrite);

    const totalDuration = Math.round(performance.now() - start);

    // Build file list for logging
    const filesList = [path.relative(rootDir, typesOutPath)];
    if (virtualOutPath) {
      filesList.push(path.relative(rootDir, virtualOutPath));
    }

    return {
      filesWritten,
      totalFiles: virtualOutPath ? 2 : 1,
      durations: {
        content: contentGenDuration,
        write: writeDuration,
        total: totalDuration,
      },
      filesList,
    };
  }

  /**
   * Validate messages and log conflicts
   */
  private validateMessages(messages: Record<string, JSONValue>): void {
    const conflicts = detectKeyConflicts(messages);
    if (conflicts.length > 0) {
      this.options.logger?.warn('⚠️  Conflicting translation keys detected:', {
        timestamp: true,
      });
      for (const conflict of conflicts) {
        this.options.logger?.warn(`   ${conflict}`, {timestamp: true});
      }
    }
  }

  /**
   * Generate file content
   */
  private async generateContent(combinedMessages: CombinedMessages<string, JSONObject>): Promise<{
    typesContent: string;
    virtualContent?: string;
  }> {
    const typesContent = toTypesContent({
      combinedMessages,
      config: this.options,

    });

    const virtualContent = this.options.virtualFilePath
      ? toVirtualModuleContent({config: this.options}, combinedMessages)
      : undefined;

    return {typesContent, virtualContent};
  }

  /**
   * Write files to disk (only if content changed)
   */
  private async writeFiles(
    typesPath: string,
    virtualPath: string | undefined,
    typesContent: string,
    virtualContent: string | undefined
  ): Promise<number> {
    let filesWritten = 0;
    this.options.logger.info(`Types Path: ${typesPath}, Virtual Path: ${virtualPath}`);


    // Write types file
    await ensureDir(typesPath);
    // if (await this.shouldWriteFile(typesPath, typesContent)) {
      await writeFileAtomic(typesPath, typesContent);
      filesWritten++;
    // }

    // Write virtual module file if specified
    if (virtualPath && virtualContent) {
      await ensureDir(virtualPath);
      if (await this.shouldWriteFile(virtualPath, virtualContent)) {
        await writeFileAtomic(virtualPath, virtualContent);
        filesWritten++;
      }
    }

    return filesWritten;
  }

  /**
   * Check if file should be written (content changed)
   */
  private async shouldWriteFile(filePath: string, newContent: string): Promise<boolean> {
    try {
      const existing = await fs.readFile(filePath, 'utf8');
      return existing !== newContent;
    } catch {
      return true; // File doesn't exist, should write
    }
  }
}


