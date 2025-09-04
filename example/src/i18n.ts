
import {createI18n} from "vue-i18n";
import {
  messagesI18n,
  type AllLocaleGen,

 type SupportedLanguagesGen,

} from "./i18n/i18n.gen";

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

