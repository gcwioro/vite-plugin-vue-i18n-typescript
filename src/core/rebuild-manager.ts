import {DevEnvironment, EnvironmentModuleNode, Logger, ViteDevServer} from 'vite'
import {canonicalize} from '../utils'
import type {JSONValue} from '../types'
import {FileManager} from './file-manager'
import {GenerationCoordinator} from './generation-coordinator'
import type {ModuleArtifact} from '../generator'

const DEBOUNCE_MS = 300
const MAX_WAIT_MS = 2000

export interface RebuildManagerOptions {
  fileManager: FileManager;
  generationCoordinator: GenerationCoordinator;
  root: string;
  logger?: Logger;
  onRebuildComplete?: (cache: {
    modules?: EnvironmentModuleNode[];
    grouped: Record<string, any>;
    jsonText: string;
    runtimeModule: ModuleArtifact;
    messagesModule: ModuleArtifact;
    typesContent: string;
  }) => void;
}

export interface RebuildResult {
  grouped: Record<string, any>;
  jsonText: string;
  modules: EnvironmentModuleNode[];
  runtimeModule: ModuleArtifact;
  messagesModule: ModuleArtifact;
  typesContent: string;
}

export class RebuildManager {
  private rebuildTimer?: ReturnType<typeof setTimeout>
  private lastRebuildCall = 0
  private serverRef?: ViteDevServer
  private resolvedVirtualId?: string
  private environment?: DevEnvironment

  constructor(private options: RebuildManagerOptions) {
  }

  setServer(server: ViteDevServer, resolvedVirtualId: string): void {
    this.serverRef = server
    this.resolvedVirtualId = resolvedVirtualId
    this.options.logger?.info(`🔧 [RebuildManager] Server reference set. Virtual ID: ${resolvedVirtualId}`)
  }

  async debouncedRebuild(reason: string, modules: EnvironmentModuleNode[]) {
    const now = Date.now()
    if (!this.lastRebuildCall) this.lastRebuildCall = now

    if (this.rebuildTimer) clearTimeout(this.rebuildTimer)

    if (now - this.lastRebuildCall >= MAX_WAIT_MS) {
      this.lastRebuildCall = 0
      return await this.rebuild(reason, modules)
    }

    return new Promise((resolve) => {
      this.rebuildTimer = setTimeout(async () => {
        this.lastRebuildCall = 0
        return resolve(await this.rebuild(reason, modules))
      }, DEBOUNCE_MS)
    })
  }

  async rebuild(reason: string, modules: EnvironmentModuleNode[]): Promise<RebuildResult> {
    const startRebuild = performance.now()

    const {grouped, stats} = await this.options.fileManager.readAndGroup()

    if (stats.filesRead > 0 || this.options.logger) {
      this.options.logger?.info(
        `📖 Read & Group: ${stats.durations.total}ms (stat: ${stats.durations.stat}ms, read ${stats.filesRead}/${stats.totalFiles} files: ${stats.durations.read}ms, merge: ${stats.durations.merge}ms)`
      )
    }

    const startCanonical = performance.now()
    const groupedCache = canonicalize(grouped as JSONValue) as Record<string, any>
    const jsonTextCache = JSON.stringify(groupedCache)
    const canonicalDuration = Math.round(performance.now() - startCanonical)

    const generationResult = await this.options.generationCoordinator.generateFiles(
      groupedCache,
      this.options.root
    )

    this.options.logger?.info(
      `📝 Generated files in ${generationResult.durations.total}ms (content: ${generationResult.durations.content}ms, write ${generationResult.filesWritten}/${generationResult.totalFiles} files: ${generationResult.durations.write}ms) | ${generationResult.filesList.join(', ')}`
    )

    const totalRebuildDuration = Math.round(performance.now() - startRebuild)

    const modulesResult = await this.invalidateModule(modules)

    this.options.onRebuildComplete?.({
      grouped: groupedCache,
      modules: modulesResult,
      jsonText: jsonTextCache,
      runtimeModule: generationResult.runtime,
      messagesModule: generationResult.messages,
      typesContent: generationResult.typesContent,
    })
    this.options.logger?.info(
      `✅ Rebuild complete (${reason}) in ${totalRebuildDuration}ms (canonicalize: ${canonicalDuration}ms) | Locales: ${Object.keys(groupedCache).join(', ')}`
    )

    return {
      modules: modulesResult ?? [],
      grouped: groupedCache,
      jsonText: jsonTextCache,
      runtimeModule: generationResult.runtime,
      messagesModule: generationResult.messages,
      typesContent: generationResult.typesContent,
    }
  }

  private async invalidateModule(modules: EnvironmentModuleNode[]) {
    this.options.logger?.info(`🔄 [invalidateModule] Module invalidation completed`)
    return modules
  }

  async setEnv(environment: DevEnvironment) {
    this.environment = environment
    this.options.logger?.info(`🔧 [RebuildManager] Environment set: ${environment.name}`)
  }
}
