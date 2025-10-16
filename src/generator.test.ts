import { describe, it, expect } from 'vitest'
import {toTypesContent} from './generator'

describe('toTypesContent', () => {
  it('should generate basic type definitions', () => {
    const result = toTypesContent({
      messages: {
        en: {
          hello: 'Hello',
          world: 'World',
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en', 'de'],
    })

    expect(result).toContain("export type AllTranslationKeys = 'hello' | 'world'")
    expect(result).toContain('export type AllSupportedLanguages = readonly')
    expect(result).toContain('export type SupportedLanguage = AllSupportedLanguages[number]')
    expect(result).toContain('export type I18nMessages =')
  })

  it('should handle nested message structure', () => {
    const result = toTypesContent({
      messages: {
        en: {
          nav: {
            home: 'Home',
            about: 'About',
          },
          forms: {
            submit: 'Submit',
          },
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain("'forms.submit'")
    expect(result).toContain("'nav.about'")
    expect(result).toContain("'nav.home'")
  })

  it('should use custom banner when provided', () => {
    const customBanner = '// Custom banner\n// Do not edit\n'
    const result = toTypesContent({
      messages: { en: { test: 'test' } },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
      banner: customBanner,
    })

    expect(result.startsWith(customBanner)).toBe(true)
    expect(result).not.toContain('AUTO-GENERATED FILE')
  })

  it('should use default banner when not provided', () => {
    const result = toTypesContent({
      messages: { en: { test: 'test' } },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain('AUTO-GENERATED FILE. DO NOT EDIT.')

    expect(result).toContain('Content-Hash:')
  })

  it('should apply default key transformation', () => {
    const result = toTypesContent({
      messages: {
        en: {
          userProfile: 'Profile',
          userSettings: 'Settings',
          adminDashboard: 'Dashboard',
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain("'adminDashboard'")
    expect(result).toContain("'userProfile'")
    expect(result).toContain("'userSettings'")
  })

  it('should handle empty messages', () => {
    const result = toTypesContent({
      messages: { en: {} },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain('export type AllTranslationKeys = never')
  })

  it('should maintain language order as provided', () => {
    const result = toTypesContent({
      messages: { en: { test: 'test' } },
      baseLocale: 'en',
      AllSupportedLanguages: ['zh', 'en', 'de', 'fr'],
    })

    // Languages should be in the same order as provided
    expect(result).toContain("AllSupportedLanguages = readonly ['zh', 'en', 'de', 'fr']")
  })

  it('should handle arrays in messages', () => {
    const result = toTypesContent({
      messages: {
        en: {
          items: ['item1', 'item2'],
          nested: {
            list: ['a', 'b'],
          },
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain("'items'")
    expect(result).toContain("'nested.list'")
  })

  it('should normalize line endings', () => {
    const result = toTypesContent({
      messages: { en: { test: 'test' } },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).not.toContain('\r\n')
    expect(result).not.toContain('\r')
    expect(result).toMatch(/\n$/)
    expect(result).not.toMatch(/\n\n$/)
  })

  it('should generate deterministic output', () => {
    const params = {
      messages: {
        en: {
          z: 'Z value',
          a: 'A value',
          m: {
            y: 'Y value',
            b: 'B value',
          },
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en', 'de'],
    }

    const result1 = toTypesContent(params)
    const result2 = toTypesContent(params)

    expect(result1).toBe(result2)
  })

  it('should properly escape special characters in JSON', () => {
    const result = toTypesContent({
      messages: {
        en: {
          quote: 'He said "Hello"',
          backslash: 'Path\\to\\file',
          newline: 'Line 1\nLine 2',
        },
      },
      baseLocale: 'en',
      AllSupportedLanguages: ['en'],
    })

    expect(result).toContain('"He said \\"Hello\\""')
    expect(result).toContain('"Path\\\\to\\\\file"')
  })
})

