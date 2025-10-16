/* eslint-disable */
/* prettier-ignore */
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 893309fd

declare module 'virtual:unplug-i18n-dts-generation' {
  import {type Plugin, type WritableComputedRef} from 'vue'
  import type {
    Composer,
    ComposerOptions as Options,
    ComposerOptions,
    I18n,
    I18nOptions,
    Locale,
    NamedValue,
    TranslateOptions,
    UseI18nOptions
  } from "vue-i18n"
  export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>
  export interface I18nCustom {
    (key: AllTranslationKeys, plural: number, options?: TranslateOptions): string

    (key: AllTranslationKeys, options?: TranslateOptions): string

    (key: AllTranslationKeys, defaultMsg?: string): string

    (key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string

    (key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string

    (key: AllTranslationKeys, named: NamedValue, plural?: number): string

    (key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions): string
    (key: AllTranslationKeys, plural: number, named: NamedValue): string
    (key: AllTranslationKeys, plural: number, defaultMsg: string): string
  }
  // I18n config options (excludes messages as they're provided by the plugin)
  export type I18nConfigOptions = Omit<I18nOptions<MessageSchemaGen, {}, {}, SupportedLanguage, false>, 'messages'>;
  export type UseI18nTypesafeReturn =
    Omit<Composer<NonNullable<Options['messages']>, NonNullable<Options['datetimeFormats']>, NonNullable<Options['numberFormats']>, Options['locale'] extends unknown ? string : Options['locale']>, 't'>
    & { t: I18nCustom };

  function createI18nInstance<T extends Partial<ComposerOptions>>(options?: T): I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>

  function createI18nInstancePlugin<T extends Partial<ComposerOptions> & I18nOptions>(options?: T): Plugin<unknown[]> & (I18n<AllTranslations, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>)

  function useI18nTypeSafe(options?: Omit<UseI18nOptions, 'messages'>): UseI18nTypesafeReturn;

  export {createI18nInstance, createI18nInstancePlugin, useI18nTypeSafe};

  export type SupportedLanguage = AllSupportedLanguages[number] | string
  export const supportedLanguages: SupportedLanguage = ['de', 'en'] as const
  export type AllTranslationKeys =
    'App.fruits.apple'
    | 'App.fruits.banana'
    | 'App.fruitsLabel'
    | 'App.greetings'
    | 'App.menu'
    | 'App.menu.0'
    | 'App.menu.1'
    | 'App.test'
  export type AllSupportedLanguages = readonly ['de', 'en']

  // Message structure types
  export type MessageSchemaGen = {
    "App": {
      "fruits": {
        "apple": "Apple | Apples",
        "banana": "Banana | Bananas"
      },
      "fruitsLabel": "There are {amount} {fruit}",
      "greetings": "Hello Typescript friends!",
      "menu": [
        "home",
        "about"
      ],
      "test": "asdf"
    }
  }
  export type I18nMessages = Readonly<Record<SupportedLanguage, MessageSchemaGen>>
  export type AllTranslations = I18nMessages
  export type MessagesType = I18nMessages
  const messages: MessagesType;
  export default messages;

  // Type-safe translate function parameters

  export {messages}
}
