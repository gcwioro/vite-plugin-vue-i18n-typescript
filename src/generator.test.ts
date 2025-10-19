import {describe, expect, it} from 'vitest'
import {toTypesContent} from './generator'
import {CombinedMessages} from './core/combined-messages'

describe('toTypesContent', () => {
  it('should generate basic type definitions', () => {
    const messages = {
      en: {
        hello: 'Hello',
        world: 'World',
      },
      de: {
        hello: 'Hallo',
        world: 'Welt',
      }
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain("export type AllTranslationKeys = 'hello' | 'world'")
    expect(result).toContain('export type AllSupportedLanguages = readonly')
    expect(result).toContain('export type SupportedLanguage = AllSupportedLanguages[number]')
    expect(result).toContain('export type MessagesType = AllTranslations')
  })

  it('should handle nested message structure', () => {
    const messages = {
      en: {
        nav: {
          home: 'Home',
          about: 'About',
        },
        forms: {
          submit: 'Submit',
        },
      },
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain("'forms.submit'")
    expect(result).toContain("'nav.about'")
    expect(result).toContain("'nav.home'")
  })

  it('should use custom banner when provided', () => {
    const customBanner = '// Custom banner\n// Do not edit\n'
    const messages = {en: {test: 'test'}};
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
      banner: customBanner,
    })

    expect(result.startsWith(customBanner)).toBe(true)
    expect(result).not.toContain('AUTO-GENERATED FILE')
  })

  it('should use default banner when not provided', () => {
    const messages = {en: {test: 'test'}};
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain('AUTO-GENERATED FILE. DO NOT EDIT.')

    expect(result).toContain('Content-Hash:')
  })

  it('should apply default key transformation', () => {
    const messages = {
      en: {
        userProfile: 'Profile',
        userSettings: 'Settings',
        adminDashboard: 'Dashboard',
      },
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain("'adminDashboard'")
    expect(result).toContain("'userProfile'")
    expect(result).toContain("'userSettings'")
  })

  it('should handle empty messages', () => {
    const messages = {en: {}};
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain('export type AllTranslationKeys = never')
  })

  it('should maintain language order as provided', () => {
    const messages = {
      zh: {test: 'test'},
      en: {test: 'test'},
      de: {test: 'test'},
      fr: {test: 'test'}
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    // Languages should be in the same order as provided (sorted alphabetically by CombinedMessages)
    expect(result).toContain("AllSupportedLanguages = readonly ['de', 'en', 'fr', 'zh']")
  })

  it('should handle arrays in messages', () => {
    const messages = {
      en: {
        items: ['item1', 'item2'],
        nested: {
          list: ['a', 'b'],
        },
      },
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain("'items'")
    expect(result).toContain("'nested.list'")
  })

  it('should normalize line endings', () => {
    const messages = {en: {test: 'test'}};
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).not.toContain('\r\n')
    expect(result).not.toContain('\r')
    expect(result).toMatch(/\n$/)
    expect(result).not.toMatch(/\n\n$/)
  })

  it('should generate deterministic output', () => {
    const messages = {
      en: {
        z: 'Z value',
        a: 'A value',
        m: {
          y: 'Y value',
          b: 'B value',
        },
      },
      de: {
        z: 'Z Wert',
        a: 'A Wert',
        m: {
          y: 'Y Wert',
          b: 'B Wert',
        },
      },
    };
    const combinedMessages1 = new CombinedMessages(messages, 'en');
    const combinedMessages2 = new CombinedMessages(messages, 'en');

    const result1 = toTypesContent({combinedMessages: combinedMessages1})
    const result2 = toTypesContent({combinedMessages: combinedMessages2})

    expect(result1).toBe(result2)
  })

  it('should properly escape special characters in JSON', () => {
    const messages = {
      en: {
        quote: 'He said "Hello"',
        backslash: 'Path\\to\\file',
        newline: 'Line 1\nLine 2',
      },
    };
    const combinedMessages = new CombinedMessages(messages, 'en');

    const result = toTypesContent({
      combinedMessages,
    })

    expect(result).toContain('"He said \\"Hello\\""')
    expect(result).toContain('"Path\\\\to\\\\file"')
  })
})

