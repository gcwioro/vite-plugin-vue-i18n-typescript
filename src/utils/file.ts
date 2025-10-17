import path from 'node:path'
import fs from 'node:fs/promises'
import {randomUUID} from 'node:crypto'

/**
 * Small helper: ensure a directory exists.
 */
export async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, {recursive: true})
}

/**
 * Atomic write: write to a temp file in the same folder, then rename.
 */
export async function writeFileAtomic(filePath: string, content: string) {
  try {
    // const dir = path.dirname(filePath)
    // const tmp = path.join(dir, `.${path.basename(filePath)}.${randomUUID()}.tmp`)
    // await fs.writeFile(tmp, content, 'utf8')
    // await fs.rename(tmp, filePath)
    //     const dir = path.dirname(filePath)
    // const tmp = path.join(dir, `.${path.basename(filePath)}.${randomUUID()}.tmp`)
    await fs.writeFile(filePath, content, 'utf8')
    // await fs.rename(tmp, filePath)
  } catch (e) {
    console.error('writeFileAtomic', e)
  }
}
