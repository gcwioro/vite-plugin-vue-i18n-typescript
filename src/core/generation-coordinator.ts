import path from 'node:path'
import {promises as fs} from 'node:fs'
import type {Logger} from 'vite'
import {detectKeyConflicts, ensureDir, writeFileAtomic} from '../utils'
import {generateModuleArtifacts, GeneratedModuleArtifacts} from '../generator'
import type {JSONObject, JSONValue} from '../types'
import {CombinedMessages} from './combined-messages'
import type {ModuleArtifact} from '../generator'

export interface GenerationOptions {
  typesPath: string;
  virtualFilePath?: string;
  baseLocale: string;
  banner?: string;
  sourceId: string;
  logger?: Logger;
}

export interface GenerationResult {
  filesWritten: number;
  totalFiles: number;
  durations: {
    content: number;
    write: number;
    total: number;
  };
  filesList: string[];
  runtime: ModuleArtifact;
  messages: ModuleArtifact;
  typesContent: string;
}

export class GenerationCoordinator {
  private lastArtifacts?: GeneratedModuleArtifacts

  constructor(private options: GenerationOptions) {
  }

  getRuntimeModule(): ModuleArtifact | undefined {
    return this.lastArtifacts?.runtime
  }

  getMessagesModule(): ModuleArtifact | undefined {
    return this.lastArtifacts?.messages
  }

  getTypesContent(): string | undefined {
    return this.lastArtifacts?.typesContent
  }

  async generateFiles(
    messages: Record<string, JSONValue>,
    rootDir: string
  ): Promise<GenerationResult> {
    const start = performance.now()

    const combinedMessages = new CombinedMessages(
      messages as Record<string, JSONObject>,
      this.options.baseLocale
    )

    const typesOutPath = path.isAbsolute(this.options.typesPath)
      ? this.options.typesPath
      : path.join(rootDir, this.options.typesPath)

    const virtualOutPath = this.options.virtualFilePath
      ? path.isAbsolute(this.options.virtualFilePath)
        ? this.options.virtualFilePath
        : path.join(rootDir, this.options.virtualFilePath)
      : undefined

    const startContentGen = performance.now()
    this.validateMessages(messages)
    const artifacts = this.generateContent(combinedMessages)
    const contentGenDuration = Math.round(performance.now() - startContentGen)

    this.lastArtifacts = artifacts

    const startWrite = performance.now()
    const filesWritten = await this.writeFiles(typesOutPath, virtualOutPath, artifacts)
    const writeDuration = Math.round(performance.now() - startWrite)

    const totalDuration = Math.round(performance.now() - start)

    const filesList = [path.relative(rootDir, typesOutPath)]
    if (virtualOutPath) {
      filesList.push(path.relative(rootDir, virtualOutPath))
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
      runtime: artifacts.runtime,
      messages: artifacts.messages,
      typesContent: artifacts.typesContent,
    }
  }

  private validateMessages(messages: Record<string, JSONValue>): void {
    const conflicts = detectKeyConflicts(messages)
    if (conflicts.length > 0) {
      this.options.logger?.warn('⚠️  Conflicting translation keys detected:', {
        timestamp: true,
      })
      for (const conflict of conflicts) {
        this.options.logger?.warn(`   ${conflict}`, {timestamp: true})
      }
    }
  }

  private generateContent(combinedMessages: CombinedMessages<string, JSONObject>): GeneratedModuleArtifacts {
    return generateModuleArtifacts({
      combinedMessages,
      banner: this.options.banner,
      sourceId: this.options.sourceId,
    })
  }

  private async writeFiles(
    typesPath: string,
    virtualPath: string | undefined,
    artifacts: GeneratedModuleArtifacts
  ): Promise<number> {
    let filesWritten = 0

    await ensureDir(typesPath)
    if (await this.shouldWriteFile(typesPath, artifacts.typesContent)) {
      await writeFileAtomic(typesPath, artifacts.typesContent)
      filesWritten++
    }

    if (virtualPath) {
      await ensureDir(virtualPath)
      const virtualContent = `${artifacts.runtime.js}\n`
      if (await this.shouldWriteFile(virtualPath, virtualContent)) {
        await writeFileAtomic(virtualPath, virtualContent)
        filesWritten++
      }
    }

    return filesWritten
  }

  private async shouldWriteFile(filePath: string, newContent: string): Promise<boolean> {
    try {
      const existing = await fs.readFile(filePath, 'utf8')
      return existing !== newContent
    } catch {
      return true
    }
  }
}
