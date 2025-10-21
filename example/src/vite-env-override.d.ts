/* eslint-disable */
/* prettier-ignore */
// @formatter:off
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 8a2c6915

// types content
declare module 'virtual:vue-i18n-types' {
   import {type Plugin, type WritableComputedRef} from 'vue'
   import { availableLocales } from 'virtual:vue-i18n-types/availableLocales'
   import type {  Composer, Locale, FallbackLocale, ComposerOptions as Options, ComposerOptions, I18n, I18nOptions, NamedValue, TranslateOptions, UseI18nOptions} from "vue-i18n"
   import type { MessagesType,AllTranslations,AllTranslationKeys,I18nMessages,MessageSchemaGen} from 'virtual:vue-i18n-types/messages'
   export type { MessagesType,AllTranslations,AllTranslationKeys,I18nMessages,MessageSchemaGen} from 'virtual:vue-i18n-types/messages'
   import type { AvailableLocale,AvailableLocales} from 'virtual:vue-i18n-types/availableLocales'
   export type { AvailableLocale,AvailableLocales} from 'virtual:vue-i18n-types/availableLocales'
   export interface I18nCustom {  (key: AllTranslationKeys, plural: number, options?: TranslateOptions): string
      (key: AllTranslationKeys, options?: TranslateOptions): string
      (key: AllTranslationKeys, defaultMsg?: string): string
      (key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string
      (key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string
      (key: AllTranslationKeys, named: NamedValue, plural?: number): string
      (key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions): string
      (key: AllTranslationKeys, plural: number, named: NamedValue): string
      (key: AllTranslationKeys, plural: number, defaultMsg: string): string
  }
  export type UseI18nTypesafeReturn = Omit<Composer<NonNullable<Options['messages']>, NonNullable<Options['datetimeFormats']>, NonNullable<Options['numberFormats']>, Options['locale'] extends unknown ? string : Options['locale']>,'t'> & { t: I18nCustom};
  export function createI18nInstance<T extends Partial<ComposerOptions> >(options?: T):
      I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"]: object, T["locale"] extends string ? T["locale"] : Locale, false>
  export function createI18nInstancePlugin<T extends Partial<ComposerOptions>&I18nOptions >(options?: T):
      Plugin<unknown[]>&( I18n<AllTranslations, T["datetimeFormats"] extends Record<string,unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false> )

  export {fallbackLocales} from 'virtual:vue-i18n-types/fallbackLocales'
  export {availableLocales} from 'virtual:vue-i18n-types/availableLocales'
  export {messages} from 'virtual:vue-i18n-types/messages'
  export const useI18nApp: ()=> UseI18nTypesafeReturn
  export function useI18nTypeSafe(options?: Omit<UseI18nOptions, 'messages'>):UseI18nTypesafeReturn;
}

declare module 'virtual:vue-i18n-types/messages' {
  export type AllTranslationKeys = 'App.fruits.apple' | 'App.fruits.banana' | 'App.fruits.label' | 'App.menu' | 'App.menu.0' | 'App.menu.1' | 'App.menu.2' | 'App.menu.3' | 'FileMergingDemo.description' | 'FileMergingDemo.feature.autoMerge' | 'FileMergingDemo.feature.hotReload' | 'FileMergingDemo.feature.typeCheck' | 'FileMergingDemo.merged.success' | 'FileMergingDemo.merged.typeSafety' | 'FileMergingDemo.title' | 'Greeting.greetings' | 'Greeting.message' | 'InterpolationDemo.birthday' | 'InterpolationDemo.profile' | 'InterpolationDemo.welcome' | 'LanguageDropdown.label' | 'NestedKeysDemo.settings.notifications.description' | 'NestedKeysDemo.settings.notifications.label' | 'NestedKeysDemo.settings.privacy.description' | 'NestedKeysDemo.settings.privacy.label' | 'NestedKeysDemo.settings.theme.description' | 'NestedKeysDemo.settings.theme.label' | 'NestedKeysDemo.status.error' | 'NestedKeysDemo.status.success' | 'NestedKeysDemo.status.warning' | 'PluralizationDemo.cart.status' | 'PluralizationDemo.explanation.format' | 'PluralizationDemo.explanation.note' | 'PluralizationDemo.explanation.parameter' | 'PluralizationDemo.files.uploaded' | 'PluralizationDemo.items' | 'PluralizationDemo.messages' | 'PluralizationDemo.notifications.unread' | 'PluralizationDemo.people' | 'PluralizationDemo.title' | 'TestHotUpdate.message'
  export type I18nMessages = Readonly<Record<AvailableLocale, MessageSchemaGen>>
  export type AllTranslations = I18nMessages
  export type MessagesType = I18nMessages
  export type MessageSchemaGen = {"App":{"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}}
  export const messages: MessagesType;
  export default messages;
}
declare module 'virtual:vue-i18n-types/availableLocales' {
  export type AvailableLocale = AvailableLocales[number]
  export type AvailableLocales = readonly ['de', 'en']
  export const availableLocales: AvailableLocales;
  export default availableLocales;
}
declare module 'virtual:vue-i18n-types/fallbackLocales' {
  import type { Locale } from "vue-i18n";
  export const fallbackLocales: { [locale in string]: Locale[];}
  export default fallbackLocales;
}
declare module 'virtual:vue-i18n-types/createI18nInstance' {
  import type {createI18nInstance as ImportedType} from 'virtual:vue-i18n-types'
  export const createI18nInstance: ImportedType
  export default createI18nInstance;
}
declare module 'virtual:vue-i18n-types/createI18nInstancePlugin' {
  import type {createI18nInstancePlugin as ImportedType} from 'virtual:vue-i18n-types'
  export const createI18nInstancePlugin: ImportedType
  export default createI18nInstancePlugin;
}
declare module 'virtual:vue-i18n-types/useI18nTypeSafe' {
  import type {useI18nTypeSafe as ImportedType} from 'virtual:vue-i18n-types'
  export const useI18nTypeSafe: ImportedType
  export default useI18nTypeSafe;
}
