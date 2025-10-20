import type {ComposerOptions, I18n, Locale, LocaleMessageValue, VueMessageType} from "vue-i18n"
import {createI18n} from "vue-i18n"
import type {MessagesType} from "virtual:unplug-i18n-dts-generation";


declare global {
  export const fallbackLocales: string[];
  export const messages: Readonly<Record<string, Record<string, LocaleMessageValue<VueMessageType>>>>;
}

export function createI18nInstance<T extends ComposerOptions>(options?: T): I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : Record<string, unknown>, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : Record<string, unknown>, T["locale"] extends string ? T["locale"] : Locale, false> {

//I18n<Messages, DateTimeFormats, NumberFormats, OptionLocale, false>
  const i18nApp = createI18n({
    fallbackLocale: fallbackLocales,
    // missingWarn: false,
    // fallbackWarn: false,
    locale: navigator?.language ?? '${config.baseLocale}',
    legacy: false,
    ...options,
    messages: messages,
  } as const);
  // @ts-expect-error globalThis not defined
  globalThis.i18nApp = i18nApp;
  // i18nApp.global.locale = navigator?.language?.split("-")?.[0] ?? '${config.baseLocale}';
  return i18nApp;
}

export default createI18nInstance;

// export function createI18nInstancePlugin<T extends Partial<ComposerOptions>&I18nOptions >(options?: T): I18n<AllTranslations, T["datetimeFormats"] extends Record<string,unknown> ? T["datetimeFormats"] : Record<string,unknown>, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : Record<string,unknown>, T["locale"] extends string ? T["locale"] : Locale, false> {
//   const i18n = createI18nInstance(options);
//   return i18n;
// }

