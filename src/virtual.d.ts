declare module 'virtual:unplug-i18n-dts-generation' {
  import {type Plugin} from 'vue'
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


  // @ts-expect-error - Virtual module provided by vite-plugin-locale-json
  function createI18nInstancePlugin<T extends Partial<ComposerOptions> & I18nOptions>(options?: T): Plugin<unknown[]> & (I18n<AllTranslationsGen, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>)

  export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>

  export interface I18nCustom {
    (key: AllTranslationKeysGen, plural: number, options?: TranslateOptions): string

    (key: AllTranslationKeysGen, options?: TranslateOptions): string

    (key: AllTranslationKeysGen, defaultMsg?: string): string

    (key: AllTranslationKeysGen, defaultMsg: string, options?: TranslateOptions): string

    (key: AllTranslationKeysGen, named: NamedValue, defaultMsg?: string): string

    (key: AllTranslationKeysGen, named: NamedValue, plural?: number): string

    (key: AllTranslationKeysGen, named: NamedValue, options?: TranslateOptions): string

    (key: AllTranslationKeysGen, plural: number, named: NamedValue): string

    (key: AllTranslationKeysGen, plural: number, defaultMsg: string): string
  }

// I18n config options (excludes messages as they're provided by the plugin)
  export type I18nConfigOptions = Omit<ComposerOptions<MessageSchemaGen, {}, SupportedLanguageUnionGen, false>, 'messages'>;
  export type UseI18nTypesafeReturn =
    Omit<Composer<NonNullable<ComposerOptions['messages']>, NonNullable<ComposerOptions['datetimeFormats']>, NonNullable<ComposerOptions['numberFormats']>, ComposerOptions['locale'] extends unknown ? string : Options['locale']>, 't'>
    & { t: I18nCustom };

  function useI18nTypeSafe(options?: Omit<UseI18nOptions, 'messages'>): UseI18nTypesafeReturn;

  export {createI18nInstance, createI18nInstancePlugin, useI18nTypeSafe};

  const supportedLanguages: readonly[string]


  export type AllTranslationKeysGen =
    'no-key'

  export type SupportedLanguagesGen = readonly ['de', 'en']
  export type SupportedLanguageUnionGen = SupportedLanguagesGen[number]

// Message structure types
  export type MessageSchemaGen = Record<string, unknown>
  export type AllLocaleGen = Readonly<Record<SupportedLanguageUnionGen, MessageSchemaGen>>
  export type AllTranslationsGen = AllLocaleGen
  export type MessagesType = AllLocaleGen

  // @ts-expect-error - Virtual module provided by vite-plugin-locale-json
  function createI18nInstance<T extends Partial<ComposerOptions>>(options?: T): I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>

  const messages: MessagesType;
  export default messages;

// Type-safe translate function parameters

  export {supportedLanguages, messages}
}
