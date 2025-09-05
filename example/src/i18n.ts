
import {createI18n} from "vue-i18n";
import type {AllLocaleGen, SupportedLanguagesGen} from "@/i18n/i18n.types";
import {messagesI18n} from "@/i18n/i18n.consts.ts";


export const i18nApp = createI18n<[AllLocaleGen], SupportedLanguagesGen, false>({
  locale: localStorage.getItem('locale') ?? 'en', // Default language
  // availableLocales: supportedLocales,
  missingWarn: false,
  fallbackWarn: false,
  fallbackLocale: 'de',
  globalInjection: true,
  messages: messagesI18n,
  legacy: false,

  inheritLocale: true,
  fallbackRoot: true,

})
export const i18n = i18nApp.global

