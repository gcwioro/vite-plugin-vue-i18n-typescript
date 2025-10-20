/* eslint-disable @typescript-eslint/no-empty-object-type */
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
  function createI18nInstancePlugin<T extends Partial<ComposerOptions> & I18nOptions>(options?: T): Plugin<unknown[]> & (I18n<AllTranslations, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>)

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
  // @ts-expect-error - Virtual module provided by vite-plugin-locale-json
  export type I18nConfigOptions = Omit<ComposerOptions<MessageSchemaGen, {}, SupportedLanguage, false>, 'messages'>;
  export type UseI18nTypesafeReturn =
    Omit<Composer<NonNullable<ComposerOptions['messages']>, NonNullable<ComposerOptions['datetimeFormats']>, NonNullable<ComposerOptions['numberFormats']>, ComposerOptions['locale'] extends unknown ? string : Options['locale']>, 't'>
    & { t: I18nCustom };

  function useI18nTypeSafe(options?: Omit<UseI18nOptions, 'messages'>): UseI18nTypesafeReturn;

  export {createI18nInstance, createI18nInstancePlugin, useI18nTypeSafe};
  export type AllSupportedLanguages = readonly ['de', 'en']
  export type SupportedLanguage = AllSupportedLanguages[number] | string
  const supportedLanguages: readonly[string]


  export type AllTranslationKeys =
    'no-key'


  export type SupportedLanguage = AllSupportedLanguages[number] | string

// Message structure types
  export type MessageSchemaGen = Record<LocaleMessageValue<VueMessageType>>
  export type I18nMessages = Readonly<Record<SupportedLanguage, MessageSchemaGen>>
  export type AllTranslations = I18nMessages
  export type MessagesType = I18nMessages

  // @ts-expect-error - Virtual module provided by vite-plugin-locale-json
  function createI18nInstance<T extends Partial<ComposerOptions>>(options?: T): I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false>

  const messages: MessagesType;
  export default messages;

// Type-safe translate function parameters

  export {supportedLanguages, messages}
}
