import fs from 'node:fs/promises'
import path from 'node:path'

import {describe, expect, it} from 'vitest'

import {generateI18nTypes} from '../src/api'
import {createTempProjectDir} from './helpers'

describe('generateI18nTypes API', () => {
  it('generates type and virtual module files with expected content', async () => {
    const projectRoot = await createTempProjectDir('basic-project')
    const typesRelPath = 'types/i18n.d.ts'
    const virtualRelPath = 'types/i18n-virtual.mjs'

    const result = await generateI18nTypes({
      root: projectRoot,
      baseLocale: 'en',
      typesPath: typesRelPath,
      virtualFilePath: virtualRelPath,
    })

    const typesAbsPath = path.join(projectRoot, typesRelPath)
    const virtualAbsPath = path.join(projectRoot, virtualRelPath)

    const typesContent = await fs.readFile(typesAbsPath, 'utf8')
    const virtualContent = await fs.readFile(virtualAbsPath, 'utf8')

    expect(result.filesWritten).toBe(2)
    expect(result.totalFiles).toBe(2)
    expect(result.generatedFiles).toEqual([typesRelPath, virtualRelPath])
    expect(result.locales).toEqual(['de', 'en'])
    expect(result.localeFilesCount).toBe(2)
    expect(result.localeFiles).toEqual(
      expect.arrayContaining([
        path.join(projectRoot, 'src/locales/de.json'),
        path.join(projectRoot, 'src/locales/en.json'),
      ]),
    )

    expect(typesContent).toContain("'App.fruits.apple'")
    expect(typesContent).toMatch(/export type AllSupportedLanguages = readonly \['de', 'en'\]/)
    expect(typesContent).toContain('export type MessageSchemaGen = {"App"')

    expect(virtualContent).toMatch(/export const supportedLanguages = \['de', 'en'\];/)
    expect(virtualContent).toContain('export const messages =')
  })

  it('applies shallow merge and transformJson during normalization', async () => {
    const projectRoot = await createTempProjectDir('basic-project')

    const overridePath = path.join(projectRoot, 'src/locales/messages.en.json')
    await fs.writeFile(
      overridePath,
      JSON.stringify(
        {
          App: {
            menu: ['Override'],
          },
          Greeting: {message: 'Override'},
        },
        null,
        2,
      ),
      'utf8',
    )

    const transformedFiles: string[] = []
    const typesRelPath = 'types/shallow.d.ts'

    const result = await generateI18nTypes({
      root: projectRoot,
      baseLocale: 'en',
      typesPath: typesRelPath,
      merge: 'shallow',
      transformJson: (json, absPath) => {
        transformedFiles.push(path.basename(absPath))
        if (absPath.endsWith('messages.en.json')) {
          const data = json as Record<string, any>
          return {
            ...data,
            App: {
              ...(data.App as Record<string, any> | undefined),
              menu: ['Override from transform'],
            },
            Greeting: {
              ...(data.Greeting as Record<string, any> | undefined),
              message: 'Override from transform',
            },
            Transformed: {
              value: 'from transform',
            },
          }
        }
        return json
      },
    })

    const typesAbsPath = path.join(projectRoot, typesRelPath)
    const typesContent = await fs.readFile(typesAbsPath, 'utf8')

    expect(result.filesWritten).toBe(1)
    expect(result.totalFiles).toBe(1)
    expect(result.generatedFiles).toEqual([typesRelPath])
    expect(result.locales).toEqual(['de', 'en'])
    expect(result.localeFilesCount).toBe(3)
    expect(result.localeFiles).toEqual(
      expect.arrayContaining([
        path.join(projectRoot, 'src/locales/de.json'),
        path.join(projectRoot, 'src/locales/en.json'),
        overridePath,
      ]),
    )

    expect(transformedFiles).toEqual(
      expect.arrayContaining(['de.json', 'en.json', 'messages.en.json']),
    )

    expect(typesContent).not.toContain("'App.fruits.apple'")
    expect(typesContent).toContain("'Transformed.value'")
    expect(typesContent).toMatch(/export type AllSupportedLanguages = readonly \['de', 'en'\]/)
    expect(typesContent).toContain('Override from transform')
  })
})
