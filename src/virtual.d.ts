// vite-plugin-example/src/virtual.d.ts

// declare module "virtual:unplug-i18n-dts-generation" {
//     import {ComposerOptions, I18n, Locale} from "vue-i18n";
//
//     const supportedLanguages: readonly[string];
//
//     const messages: Readonly<Record<string, Record<string, unknown>>>;
//     export default messages;
//     function createI18nInstance<T extends Partial<ComposerOptions> >(options?: T): I18n<typeof messages, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : {}, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : {}, T["locale"] extends string ? T["locale"] : Locale, false>;
//     export { supportedLanguages, messages,createI18nInstance };
// }
