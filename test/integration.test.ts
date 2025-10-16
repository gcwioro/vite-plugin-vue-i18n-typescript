import {createServer} from 'vite'
import fs from 'fs/promises'
import {describe, expect, it} from 'vitest'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import unpluginVueI18nDtsGeneration from "../src/index";
import vue from "@vitejs/plugin-vue";


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../example')
const dtsPath = path.resolve(root, 'vite-env-override.d.ts')
describe('i18n type generation', () => {
  it('generates types for array keys', async () => {
    await fs.rm(dtsPath, {force: true, recursive: true}).catch(() => {
    })

    // Give OS time to complete delete operation
    await new Promise(resolve => setTimeout(resolve, 100))

    const server = await createServer({
      root,
      configFile: false,
      plugins: [vue(), unpluginVueI18nDtsGeneration({
        typesPath: './vite-env-override.d.ts'
      })],
    })
    try {
      // Give plugin time to run configResolved hook
      await new Promise(resolve => setTimeout(resolve, 500))

      // Wait for buildStart to complete and file to be generated
      const maxWaitTime = 10000 // 10 seconds
      const startTime = Date.now()
      let fileExists = false

      while (Date.now() - startTime < maxWaitTime) {
        try {
          await fs.access(dtsPath)
          fileExists = true
          break
        } catch {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      expect(fileExists).toBe(true)

      const content = await fs.readFile(dtsPath, 'utf-8')
      expect(content).toContain("'App.greetings'")
      expect(content).toContain("'App.fruits")
      expect(content).toContain("'App.menu'")
      expect(content).toContain("'en'")
    } finally {
      await server.close()
    }
  }, 15000) // Increase timeout to 15 seconds
})
