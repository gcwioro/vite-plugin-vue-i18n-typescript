/* eslint-disable */
/* prettier-ignore */
// biome-ignore lint: disable
// noinspection JSUnusedGlobalSymbols'
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 7541cc3d


declare module '@unplug-i18n-types-locales' {


  const messages: Record<string, any>
  export default messages
}

import type { I18nOptions } from 'vue-i18n'

export type AllTranslationKeysGen = 'App.fruits.apple' | 'App.fruits.banana' | 'App.greetings' | 'App.menu' | 'App.menu.0' | 'App.menu.1'
export type SupportedLanguagesGen = readonly ['en']
export type SupportedLanguageUnionGen = SupportedLanguagesGen[number]

// Message structure types
export type MessageSchemaGen = {
  "App": {
    "fruits": {
      "apple": "Apple | Apples",
      "banana": "Banana | Bananas"
    },
    "greetings": "Hello Typescript friends!",
    "menu": [
      "home",
      "about"
    ]
  }
}
export type AllLocaleGen = Readonly<Record<SupportedLanguageUnionGen, MessageSchemaGen>>
export type AllTranslationsGen = AllLocaleGen

// Type-safe translate function parameters
export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>

// I18n config options (excludes messages as they're provided by the plugin)
export type I18nConfigOptions = Omit<I18nOptions<MessageSchemaGen, {}, {}, SupportedLanguageUnionGen, false>, 'messages'>
