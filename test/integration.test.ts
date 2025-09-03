import { createServer } from 'vite'
import fs from 'fs/promises'
import path from 'path'
import { describe, it, expect } from 'vitest'

const projectRoot = path.resolve(__dirname, '../test-project')
const dtsPath = path.resolve(projectRoot, 'src/types/i18n.d.ts')

describe('i18n type generation', () => {
  it('generates types for array keys', async () => {
    await fs.rm(dtsPath, { force: true, recursive: true })

    const server = await createServer({
      root: projectRoot,
      configFile: path.resolve(projectRoot, 'vite.config.ts'),
      logLevel: 'error',
    })
    await server.close()

    const content = await fs.readFile(dtsPath, 'utf-8')
    expect(content).toContain("'greeting'")
    expect(content).toContain("'fruits'")
    expect(content).toContain("'nested.menu'")
    expect(content).not.toContain("'fruits.0'")
    expect(content).toContain("'en'")
    expect(content).toContain("'de'")
  })
})
