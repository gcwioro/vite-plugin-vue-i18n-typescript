import fs from 'node:fs/promises'
import path from 'node:path'

import {build} from 'vite'
import {describe, expect, it} from 'vitest'

import vitePluginVueI18nTypes from '../src/index'
import {
  createTempProjectDir,
  waitForFile,
} from './helpers'

describe('Tree-shaking integration tests', () => {
  it('should tree-shake unused sub-modules when only messages are imported', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const distDir = path.join(projectRoot, 'dist')

    // Create a simple entry file that only imports messages
    const entryContent = `
import { messages } from 'virtual:vue-i18n-types/messages'

// Use messages to prevent dead code elimination
const enMessages = messages['en']
console.log(enMessages?.welcome || 'Hello')

export { messages } from 'virtual:vue-i18n-types/messages'
`
    await fs.writeFile(
      path.join(projectRoot, 'src/main-messages.ts'),
      entryContent
    )

    // Build the project
    await build({
      root: projectRoot,
      configFile: false,
      logLevel: 'silent',
      build: {
        outDir: distDir,
        lib: {
          entry: path.join(projectRoot, 'src/main-messages.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue', 'vue-i18n'],
        },
      },
      plugins: [
        vitePluginVueI18nTypes({
          typesPath: 'src/types.d.ts',
          baseLocale: 'en',
        }),
      ],
    })

    // Read the built JS file
    const builtFiles = await fs.readdir(distDir)
    const jsFile = builtFiles.find(f => f.endsWith('.mjs'))
    if (!jsFile) throw new Error('No JS file found in build output')

    const jsContent = await fs.readFile(path.join(distDir, jsFile), 'utf-8')
    console.log(jsContent)
    // Check that messages are included but other exports are not
    expect(jsContent).toContain('Banane | Bananen')
    expect(jsContent).not.toContain('createI18nInstance')
    expect(jsContent).not.toContain('useI18nTypeSafe')
    expect(jsContent).not.toContain('availableLocales')
  })

  it('should tree-shake unused sub-modules when only availableLocales is imported', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const distDir = path.join(projectRoot, 'dist')

    // Create entry file that only imports availableLocales
    const entryContent = `
import { availableLocales } from 'virtual:vue-i18n-types/availableLocales'

// Use availableLocales to prevent dead code elimination
console.log('Available locales:', availableLocales.join(', '))

export { availableLocales }
`
    await fs.writeFile(
      path.join(projectRoot, 'src/main-locales.ts'),
      entryContent
    )

    // Build the project
    await build({
      root: projectRoot,
      configFile: false,
      logLevel: 'silent',
      build: {
        outDir: distDir,
        lib: {
          entry: path.join(projectRoot, 'src/main-locales.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue', 'vue-i18n'],
        },
      },
      plugins: [
        vitePluginVueI18nTypes({
          typesPath: 'src/types.d.ts',
          baseLocale: 'en',
        }),
      ],
    })

    // Read the built JS file
    const builtFiles = await fs.readdir(distDir)
    const jsFile = builtFiles.find(f => f.endsWith('.mjs'))
    if (!jsFile) throw new Error('No JS file found in build output')

    const jsContent = await fs.readFile(path.join(distDir, jsFile), 'utf-8')

    // availableLocales should be there but not the full messages
    // Check for availableLocales array in minified code
    expect(jsContent).toMatch(/\["de",\s*"en"\]|\["en",\s*"de"\]/)
    expect(jsContent).not.toContain('Banane | Bananen')
    expect(jsContent).not.toContain('createI18nInstance')
  })

  it('should include all exports when importing from main module', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const distDir = path.join(projectRoot, 'dist')

    // Create entry file that imports multiple exports from main module
    const entryContent = `
import { messages, availableLocales, createI18nInstance } from 'virtual:vue-i18n-types'

// Use all imports to prevent dead code elimination
const i18n = createI18nInstance({
  locale: 'en',
  fallbackLocale: 'en'
})

console.log('Messages:', messages)
console.log('Available locales:', availableLocales)
console.log('i18n instance:', i18n)

export { messages, availableLocales, createI18nInstance }
`
    await fs.writeFile(
      path.join(projectRoot, 'src/main-full.ts'),
      entryContent
    )

    // Build the project
    await build({
      root: projectRoot,
      configFile: false,
      logLevel: 'silent',
      build: {
        outDir: distDir,
        lib: {
          entry: path.join(projectRoot, 'src/main-full.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue', 'vue-i18n'],
        },
      },
      plugins: [
        vitePluginVueI18nTypes({
          typesPath: 'src/types.d.ts',
          baseLocale: 'en',
        }),
      ],
    })

    // Read the built JS file
    const builtFiles = await fs.readdir(distDir)
    const jsFile = builtFiles.find(f => f.endsWith('.mjs'))
    if (!jsFile) throw new Error('No JS file found in build output')

    const jsContent = await fs.readFile(path.join(distDir, jsFile), 'utf-8')

    // All functionality should be included
    // Check for key parts of the translations
    expect(jsContent).toMatch(/Hello TypeScript|Hallo TypeScript/) // messages content
    expect(jsContent).toContain('createI18n') // i18n creation
    expect(jsContent).toMatch(/\["de",\s*"en"\]|\["en",\s*"de"\]/) // availableLocales
  })

  it('should produce smaller bundle when using sub-module imports vs main module', async () => {
    const projectRoot = await createTempProjectDir('basic-project')

    // Build with sub-module import
    const distSubmodule = path.join(projectRoot, 'dist-submodule')
    const submoduleEntry = `
import { messages } from 'virtual:vue-i18n-types/messages'

// Use messages to prevent dead code elimination
const enMessages = messages['en']
console.log(enMessages?.welcome || 'Hello')

export { messages }
`
    await fs.writeFile(
      path.join(projectRoot, 'src/entry-submodule.ts'),
      submoduleEntry
    )

    await build({
      root: projectRoot,
      configFile: false,
      logLevel: 'silent',
      build: {
        outDir: distSubmodule,
        lib: {
          entry: path.join(projectRoot, 'src/entry-submodule.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue', 'vue-i18n'],
        },
      },
      plugins: [
        vitePluginVueI18nTypes({
          typesPath: 'src/types.d.ts',
          baseLocale: 'en',
        }),
      ],
    })

    // Build with main module import
    const distMain = path.join(projectRoot, 'dist-main')
    const mainEntry = `
import { messages, createI18nInstance, availableLocales } from 'virtual:vue-i18n-types'

// Using all imports to prevent dead code elimination
const i18n = createI18nInstance()
console.log(availableLocales)
console.log(messages['en']?.welcome || 'Hello')

export { messages, createI18nInstance, availableLocales }
`
    await fs.writeFile(
      path.join(projectRoot, 'src/entry-main.ts'),
      mainEntry
    )

    await build({
      root: projectRoot,
      configFile: false,
      logLevel: 'silent',
      build: {
        outDir: distMain,
        lib: {
          entry: path.join(projectRoot, 'src/entry-main.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: ['vue', 'vue-i18n'],
        },
      },
      plugins: [
        vitePluginVueI18nTypes({
          typesPath: 'src/types.d.ts',
          baseLocale: 'en',
        }),
      ],
    })

    // Compare bundle sizes
    const submoduleFiles = await fs.readdir(distSubmodule)
    const submoduleJs = submoduleFiles.find(f => f.endsWith('.js') || f.endsWith('.mjs'))
    if (!submoduleJs) throw new Error('No JS file in submodule build')

    const mainFiles = await fs.readdir(distMain)
    const mainJs = mainFiles.find(f => f.endsWith('.js') || f.endsWith('.mjs'))
    if (!mainJs) throw new Error('No JS file in main build')

    const submoduleStats = await fs.stat(path.join(distSubmodule, submoduleJs))
    const mainStats = await fs.stat(path.join(distMain, mainJs))

    // Main module bundle should be significantly larger due to i18n runtime
    expect(mainStats.size).toBeGreaterThan(submoduleStats.size)

    // Log sizes for visibility
    console.log(`Submodule bundle size: ${submoduleStats.size} bytes`)
    console.log(`Main module bundle size: ${mainStats.size} bytes`)
    console.log(`Size difference: ${mainStats.size - submoduleStats.size} bytes`)
  })
})
