import fs from 'node:fs/promises'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import {build} from 'vite'
import {describe, expect, it, vi} from 'vitest'

import unpluginVueI18nTypes from '../src/index'
import {
  createTempProjectDir,
  waitForFile,
  waitForFileContent,
  withDevServer,
} from './helpers'


async function findLocalesAsset(dir: string): Promise<string | undefined> {
  const entries = await fs.readdir(dir, {withFileTypes: true})

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isFile() && entry.name.includes('locales')) {
      return fullPath
    }
    if (entry.isDirectory()) {
      const nested = await findLocalesAsset(fullPath)
      if (nested) return nested
    }
  }

  return undefined
}


describe('vite-plugin-vue-i18n-types integration (dev + build)', () => {
  it('regenerates nested type definitions and emits websocket payloads during dev', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const relativeTypesPath = './custom/types/generated/i18n.d.ts'
    const dtsPath = path.join(projectRoot, 'custom/types/generated/i18n.d.ts')
    const enLocalePath = path.join(projectRoot, 'src/locales/en.json')

    await withDevServer(
      {
        root: projectRoot,
        configFile: false,
        plugins: [
          vue(),
          unpluginVueI18nTypes({
            typesPath: relativeTypesPath,
            baseLocale: 'en',
          }),
        ],
      },
      async (server) => {
        const sendSpy = vi.spyOn(server.ws, 'send')

        await waitForFile(dtsPath)
        const initialContent = await fs.readFile(dtsPath, 'utf-8')

        expect(initialContent).toContain("'App.menu'")

        const typesDirStat = await fs.stat(path.dirname(dtsPath))
        expect(typesDirStat.isDirectory()).toBe(true)

        sendSpy.mockClear()

        const locale = JSON.parse(await fs.readFile(enLocalePath, 'utf-8')) as any
        locale.App.fruits.blueberry = 'blueberry | blueberries'
        await fs.writeFile(enLocalePath, JSON.stringify(locale, null, 2), 'utf-8')

        const updatedContent = await waitForFileContent(
          dtsPath,
          (content) => content.includes("'App.fruits.blueberry'")
        )

        expect(updatedContent).toContain("'App.fruits.blueberry'")

        await expect
          .poll(
            () =>
              sendSpy.mock.calls
                .map((call) => call[0])
                .filter((payload) => payload?.event === 'i18n-update').length,
            {interval: 200, timeout: 5000}
          )
          .toBeGreaterThan(0)

        const updatePayload = [...sendSpy.mock.calls]
          .map((call) => call[0] as any)
          .reverse()
          .find((payload) => payload?.event === 'i18n-update')

        expect(updatePayload?.type).toBe('custom')
        expect(updatePayload?.event).toBe('i18n-update')
        expect(updatePayload?.data?.messages?.en?.App?.fruits?.blueberry).toBe(
          'blueberry | blueberries'
        )
        expect(updatePayload?.data?.messages?.de?.App?.fruits?.apple).toBe(
          'Apfel | Äpfel'
        )
        expect(typeof updatePayload?.data?.timestamp).toBe('number')

        sendSpy.mockRestore()
      }
    )
  }, 20000)

  it('writes nested type definitions and emits locales asset during build', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const relativeTypesPath = './types/nested/generated/i18n.d.ts'
    const dtsPath = path.join(projectRoot, 'types/nested/generated/i18n.d.ts')
    const distDir = path.join(projectRoot, 'dist')
    const assetDir = path.join(distDir, 'assets')

    await fs.mkdir(path.join(projectRoot, 'src'), {recursive: true})
    await fs.writeFile(
      path.join(projectRoot, 'src/main.ts'),
      "export const hello = 'world'\n",
      'utf-8'
    )
    await fs.writeFile(
      path.join(projectRoot, 'index.html'),
      '<!DOCTYPE html><html><body><script type="module" src="/src/main.ts"></script></body></html>',
      'utf-8'
    )

    await build({
      root: projectRoot,
      configFile: false,
      plugins: [
        vue(),
        unpluginVueI18nTypes({
          typesPath: relativeTypesPath,
          emit: {
            emitJson: true,
          },
        }),
      ],
      build: {
        outDir: distDir,
        emptyOutDir: true,
      },
    })

    const typesDirStat = await fs.stat(path.dirname(dtsPath))
    expect(typesDirStat.isDirectory()).toBe(true)

    const typesContent = await fs.readFile(dtsPath, 'utf-8')
    expect(typesContent).toContain("declare module 'virtual:vue-i18n-types'")
    expect(typesContent).toContain("'App.fruits.apple'")

    const assetPath = await findLocalesAsset(assetDir)
    expect(assetPath, 'expected emitted locales asset').toBeDefined()

    const assetStat = await fs.stat(assetPath as string)
    expect(assetStat.isFile()).toBe(true)

    const assetContent = JSON.parse(await fs.readFile(assetPath as string, 'utf-8'))
    expect(assetContent.en.App.fruits.apple).toBe('apple | apples')
    expect(assetContent.de.App.fruits.apple).toBe('Apfel | Äpfel')
  }, 20000)
})
