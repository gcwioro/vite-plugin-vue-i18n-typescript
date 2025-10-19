/* eslint-disable */
/* prettier-ignore */
// @formatter:off
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 518afda9

declare module 'virtual:vue-i18n-types' {
  import { createI18n, useI18n } from 'vue-i18n';
  import type { NamedValue, TranslateOptions } from 'vue-i18n';
  import messages, { supportedLanguages, baseLocale } from './messages';
  type BaseI18nOptions = Parameters<typeof createI18n>[0];
  export type AllSupportedLanguages = typeof supportedLanguages;
  export type SupportedLanguage = AllSupportedLanguages[number];
  export type MessagesType = typeof messages;
  export type AllTranslations = MessagesType;
  type BaseLocaleKey = Extract<typeof baseLocale, keyof MessagesType>;
  type BaseMessages = BaseLocaleKey extends never ? Record<string, unknown> : MessagesType[BaseLocaleKey];
  export type MessageSchemaGen = BaseMessages;
  export type AllTranslationKeys = "App.fruits.apple" | "App.fruits.banana" | "App.fruits.label" | "App.fruitsLabel" | "App.menu" | "App.menu.0" | "App.menu.1" | "App.menu.2" | "App.menu.3" | "FileMergingDemo.description" | "FileMergingDemo.feature.autoMerge" | "FileMergingDemo.feature.hotReload" | "FileMergingDemo.feature.typeCheck" | "FileMergingDemo.merged.success" | "FileMergingDemo.merged.typeSafety" | "FileMergingDemo.title" | "Greeting.greetings" | "Greeting.message" | "InterpolationDemo.birthday" | "InterpolationDemo.profile" | "InterpolationDemo.welcome" | "LanguageDropdown.label" | "NestedKeysDemo.settings.notifications.description" | "NestedKeysDemo.settings.notifications.label" | "NestedKeysDemo.settings.privacy.description" | "NestedKeysDemo.settings.privacy.label" | "NestedKeysDemo.settings.theme.description" | "NestedKeysDemo.settings.theme.label" | "NestedKeysDemo.status.error" | "NestedKeysDemo.status.success" | "NestedKeysDemo.status.warning" | "PluralizationDemo.cart.status" | "PluralizationDemo.explanation.format" | "PluralizationDemo.explanation.note" | "PluralizationDemo.explanation.parameter" | "PluralizationDemo.files.uploaded" | "PluralizationDemo.items" | "PluralizationDemo.messages" | "PluralizationDemo.notifications.unread" | "PluralizationDemo.people" | "PluralizationDemo.title";
  type UseI18nParameters = Parameters<typeof useI18n<MessageSchemaGen, SupportedLanguage>>[0];
  type SanitizedUseI18nOptions = UseI18nParameters extends undefined ? undefined : Omit<NonNullable<UseI18nParameters>, 'messages'>;
  type BaseComposer = ReturnType<typeof useI18n<MessageSchemaGen, SupportedLanguage>>;
  type I18nInstance = ReturnType<typeof createI18n>;
  type BaseFallbackLocale = BaseI18nOptions extends {
      fallbackLocale?: infer T;
  } ? T : Record<string, readonly string[]>;
  export { messages, supportedLanguages, baseLocale };
  export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>;
  export interface I18nCustom {
      (key: AllTranslationKeys, plural: number, options?: TranslateOptions): string;
      (key: AllTranslationKeys, options?: TranslateOptions): string;
      (key: AllTranslationKeys, defaultMsg?: string): string;
      (key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string;
      (key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string;
      (key: AllTranslationKeys, named: NamedValue, plural?: number): string;
      (key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions): string;
      (key: AllTranslationKeys, plural: number, named: NamedValue): string;
      (key: AllTranslationKeys, plural: number, defaultMsg: string): string;
  }
  export type I18nConfigOptions = Omit<BaseI18nOptions, 'messages'>;
  export type UseI18nTypesafeReturn = Omit<BaseComposer, 't'> & {
      t: I18nCustom;
  };
  declare const fallBackLocales: BaseFallbackLocale;
  export { fallBackLocales };
  export declare function useI18nApp(): I18nInstance;
  export declare function createI18nInstance(options?: Partial<BaseI18nOptions>): I18nInstance;
  export declare function createI18nInstancePlugin(options?: Partial<BaseI18nOptions>): I18nInstance;
  export declare function useI18nTypeSafe(options?: SanitizedUseI18nOptions): UseI18nTypesafeReturn;
}

declare module 'virtual:vue-i18n-types/messages' {
  export {messages as default, messages, supportedLanguages, baseLocale} from 'virtual:vue-i18n-types';
  export type {MessageSchemaGen, MessagesType, AllTranslations, AllSupportedLanguages, AllTranslationKeys, SupportedLanguage} from 'virtual:vue-i18n-types';
}
