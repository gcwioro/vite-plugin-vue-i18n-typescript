import {createServer} from 'vite'
import fs from 'fs/promises'
import {describe, expect, it} from 'vitest'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import unpluginVueI18nDtsGeneration from "../src/index";
import vue from "@vitejs/plugin-vue";


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../example')
const dtsPath = path.resolve(root, 'src/i18n/i18n.gen.ts')
describe('i18n type generation', () => {
  it('generates types for array keys', async () => {
    await fs.rm(dtsPath, {force: true, recursive: true})
    console.log(root)
    const server = await createServer({
      root,
      configFile: false,
      plugins: [vue(), unpluginVueI18nDtsGeneration()],
    })
    try {
      await server.listen()
      const content = await fs.readFile(dtsPath, 'utf-8')
      expect(content).toContain("'App.greetings'")
      expect(content).toContain("'App.fruits")
      expect(content).toContain("'App.menu'")
      expect(content).toContain("'en'")
    } finally {
      await server.close()
    }
  })
})
