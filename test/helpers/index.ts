import {promises as fs} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {afterEach, expect} from 'vitest'
import {createServer, type InlineConfig, type ViteDevServer} from 'vite'
import {FileChangeInfo} from "node:fs/promises";

type CleanupFn = () => Promise<void> | void

const cleanupCallbacks: CleanupFn[] = []
const tempDirectories = new Set<string>()

const helpersDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.resolve(helpersDir, '../fixtures')

function registerCleanup(callback: CleanupFn): void {
  cleanupCallbacks.push(callback)
}

async function removeDirectory(dir: string): Promise<void> {
  await fs.rm(dir, {recursive: true, force: true})
}

afterEach(async () => {
  const callbacks = cleanupCallbacks.splice(0).reverse()
  for (const cleanup of callbacks) {
    try {
      await cleanup()
    } catch {
      // Ignore cleanup errors to avoid masking test failures
    }
  }

  const dirs = Array.from(tempDirectories)
  // tempDirectories.clear()
  for (const dir of dirs) {
    try {
      // await removeDirectory(dir)
    } catch {
      // Ignore cleanup errors to avoid masking test failures
    }
  }
})

async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, {recursive: true})
  const entries = await fs.readdir(src, {withFileTypes: true})
  await Promise.all(entries.map(async (entry) => {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else if (entry.isSymbolicLink()) {
      const target = await fs.readlink(srcPath)
      await fs.symlink(target, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }))
}

export async function createTempProjectDir(fixtureName: string): Promise<string> {
  const sourceDir = path.join(fixturesDir, fixtureName)
  try {
    await fs.access(sourceDir)
  } catch {
    throw new Error(`Fixture not found: ${fixtureName}`)
  }
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  let tempDir = path.join(os.tmpdir(), 'vite-plugin-vue-i18n-types', randomSuffix);
  await fs.mkdir(tempDir, {recursive: true});
  await copyDirectory(sourceDir, tempDir)
  tempDirectories.add(tempDir)
  registerCleanup(() => removeDirectory(tempDir))
  return tempDir
}

export async function waitForFile(
  filePath: string,
  {timeoutMs = 10_000, pollIntervalMs = 100}: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await fs.access(filePath)
      return
    } catch {
      // File not accessible yet
    }
    await sleep(pollIntervalMs)
  }
  throw new Error(`Timed out waiting for file: ${filePath}`)
}


export async function waitForFileContentContain(
  filePath: string,
  predicate: string,
  {timeoutMs = 10_000, pollIntervalMs = 1000}: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<string> {
  const start = Date.now()
  let lastError: unknown

  await sleep(pollIntervalMs)
  while (Date.now() - start < timeoutMs) {
    try {

      // check if file exists

      console.log(`Checking file content match of ${filePath}...`)
      const content = await fs.readFile(filePath, {flag: 'r', encoding: 'utf8'})
      const a: NodeJS.AsyncIterator<FileChangeInfo<string>> = fs.watch(filePath, {encoding: 'utf8'})


      if (content) {
        expect(content).toContain(predicate)
        return content
      } else {
        console.log(`File content of ${filePath} did not satisfy predicate yet.`, content.slice(0, 100))

      }
    } catch (error) {
      lastError = error
    }

    await sleep(pollIntervalMs)
  }

  const error = new Error(`Timed out waiting for file content: ${filePath}`)
  ;(error as Error & { cause?: unknown }).cause = lastError
  throw error
}

export async function waitForRealFileChange(filePath: string,
                                            {timeoutMs = 10_000}: { timeoutMs?: number } = {}) {
  return waitForFileChange(filePath, false, {timeoutMs});
}


export async function waitForFileChange(
  filePath: string, returnFileOnNoChange = true,
  {timeoutMs = 10_000}: { timeoutMs?: number } = {}
): Promise<string> {
  const ac = new AbortController();
  const {signal} = ac;
  setTimeout(() => ac.abort(), timeoutMs);


  try {
    const watcher = fs.watch(filePath, {signal});
    for await (const event of watcher) {
      console.log(`File change detected: ${event.eventType} on ${event.filename}`);
      return await fs.readFile(filePath, {encoding: 'utf-8'});
    }

  } catch (err: any) {
    if (err.name !== 'AbortError')
      throw err;
  }
  if (returnFileOnNoChange) {
    return await fs.readFile
    (filePath, {encoding: 'utf-8'});
  }
  throw new Error(`Timed out waiting for file change: ${filePath}`);


}

export async function withDevServer<T>(
  config: InlineConfig,
  run: (server: ViteDevServer) => Promise<T>
): Promise<T> {
  const server = await createServer(config)
  let closed = false

  async function closeServer(): Promise<void> {
    if (!closed) {
      closed = true
      await server.close()
    }
  }

  registerCleanup(closeServer)

  try {
    await server.listen(config?.server?.port)
    const result = await run(server)
    await closeServer()
    return result
  } catch (error) {
    await closeServer()
    throw error
  }
}

export function registerTestCleanup(callback: CleanupFn): void {
  // registerCleanup(callback)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
