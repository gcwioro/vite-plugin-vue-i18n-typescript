import fs from 'node:fs/promises'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import {describe, expect, it} from 'vitest'

import unpluginVueI18nDtsGeneration from '../src/index'
import {
  createTempProjectDir,
  registerTestCleanup,
  sleep,
  waitForFileContent,
  withDevServer,
} from './helpers'

describe('i18n type generation', () => {
  it('generates types for array keys', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const dtsPath = path.join(projectRoot, 'src/vite-env-override.d.ts')

    await fs.rm(dtsPath, {force: true}).catch(() => {})
    await sleep(100)

    await withDevServer({
      root: projectRoot,
      configFile: false,
      plugins: [
        vue(),
        unpluginVueI18nDtsGeneration({
          typesPath: './src/vite-env-override.d.ts',
        }),
      ],
    }, async () => {
      const content = await waitForFileContent(
        dtsPath,
        (value) => value.includes("'App.fruits.apple'")
      )

      expect(content).toContain("'App.fruits.apple'")
      expect(content).toContain("'App.fruits")
      expect(content).toContain("'App.menu'")
      expect(content).toContain("'en'")
    })
  }, 15000)

  it('detects new locale files without restarting the dev server', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const dtsPath = path.join(projectRoot, 'src/vite-env-override.d.ts')
    const newLocalePath = path.join(projectRoot, 'src/locales/fr.json')

    await fs.rm(newLocalePath, {force: true}).catch(() => {})
    registerTestCleanup(() => fs.rm(newLocalePath, {force: true}).catch(() => {}))

    await withDevServer({
      root: projectRoot,
      configFile: false,
      plugins: [
        vue(),
        unpluginVueI18nDtsGeneration({
          typesPath: './src/vite-env-override.d.ts',
        }),
      ],
    }, async () => {
      await waitForFileContent(
        dtsPath,
        (value) => value.includes("'App.fruits.apple'")
      )

      const frMessages = {
        Greeting: {
          message: 'Bonjour TypeScript !',
        },
      }

      await fs.writeFile(newLocalePath, JSON.stringify(frMessages, null, 2), 'utf-8')

      await waitForFileContent(
        dtsPath,
        (content) => content.includes("AllSupportedLanguages = readonly ['de', 'en', 'fr']")
      )
    })
  }, 20000)
})
