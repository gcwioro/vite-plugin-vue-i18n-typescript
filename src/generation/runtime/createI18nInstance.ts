// import type {MessagesType} from "virtual:vue-i18n-types";
import type {ComposerOptions, DefaultLocaleMessageSchema, I18n, Locale} from "vue-i18n"
import {createI18n} from "vue-i18n"

declare global {
  export const fallbackLocales: string[];
  export const messages: DefaultLocaleMessageSchema;
}

export function createI18nInstance<T extends ComposerOptions>(options?: T): I18n<DefaultLocaleMessageSchema, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : Record<string, unknown>, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : Record<string, unknown>, T["locale"] extends string ? T["locale"] : Locale, false> {

//I18n<Messages, DateTimeFormats, NumberFormats, OptionLocale, false>
  const i18nApp = createI18n({
    fallbackLocale: fallbackLocales,
    // missingWarn: false,
    // fallbackWarn: false,
    locale: navigator?.language,
    legacy: false,
    ...options,
    messages: messages,
  } as const as any);
  // @ts-expect-error globalThis not defined
  globalThis.i18nApp = i18nApp;
  // i18nApp.global.locale = navigator?.language?.split("-")?.[0] ?? '${config.baseLocale}';
  return i18nApp as I18n<DefaultLocaleMessageSchema, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : Record<string, unknown>, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : Record<string, unknown>, T["locale"] extends string ? T["locale"] : Locale, false>;
}

export default createI18nInstance;

// export function createI18nInstancePlugin<T extends Partial<ComposerOptions>&I18nOptions >(options?: T): I18n<AllTranslations, T["datetimeFormats"] extends Record<string,unknown> ? T["datetimeFormats"] : Record<string,unknown>, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : Record<string,unknown>, T["locale"] extends string ? T["locale"] : Locale, false> {
//   const i18n = createI18nInstance(options);
//   return i18n;
// }

