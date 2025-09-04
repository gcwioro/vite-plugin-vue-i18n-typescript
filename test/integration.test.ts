import {createServer} from 'vite'
import fs from 'fs/promises'
import {describe, expect, it} from 'vitest'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import unpluginVueI18nDtsGeneration from "../src/index";
import vue from "@vitejs/plugin-vue";


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../test-project')
const dtsPath = path.resolve(root, 'src/types/i18n.d.ts')
describe('i18n type generation', () => {
  it('generates types for array keys', async () => {
    await fs.rm(dtsPath, {force: true, recursive: true})
    console.log(root)
    const server = await createServer({
      root,
      configFile: path.resolve(root, 'vite.config.ts'),
      plugins: [vue(), unpluginVueI18nDtsGeneration()],
    })
    try {
      await server.listen()
      const content = await fs.readFile(dtsPath, 'utf-8')
      expect(content).toContain("'greeting'")
      expect(content).toContain("'fruits'")
      expect(content).toContain("'nested.menu'")
      expect(content).not.toContain("'fruits.0'")
      expect(content).toContain("'en'")
      expect(content).toContain("'de'")
    } finally {
      await server.close()
    }
  })
})
