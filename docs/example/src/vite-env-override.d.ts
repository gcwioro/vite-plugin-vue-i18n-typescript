/* eslint-disable */
/* prettier-ignore */
// @formatter:off
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 0fae029d

// types content



// declare global {
//    const _MessageScheme = {"App":{"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}};
//    type _MessageSchemeType = typeof _MessageScheme;
//    const _AllTranslationKeys = 'App.menu' | 'App.menu.0' | 'App.menu.1' | 'App.menu.2' | 'App.menu.3' | 'FileMergingDemo.description' | 'FileMergingDemo.feature.autoMerge' | 'FileMergingDemo.feature.hotReload' | 'FileMergingDemo.feature.typeCheck' | 'FileMergingDemo.merged.success' | 'FileMergingDemo.merged.typeSafety' | 'FileMergingDemo.title' | 'Greeting.greetings' | 'Greeting.message' | 'InterpolationDemo.birthday' | 'InterpolationDemo.profile' | 'InterpolationDemo.welcome' | 'LanguageDropdown.label' | 'NestedKeysDemo.settings.notifications.description' | 'NestedKeysDemo.settings.notifications.label' | 'NestedKeysDemo.settings.privacy.description' | 'NestedKeysDemo.settings.privacy.label' | 'NestedKeysDemo.settings.theme.description' | 'NestedKeysDemo.settings.theme.label' | 'NestedKeysDemo.status.error' | 'NestedKeysDemo.status.success' | 'NestedKeysDemo.status.warning' | 'PluralizationDemo.cart.status' | 'PluralizationDemo.explanation.format' | 'PluralizationDemo.explanation.note' | 'PluralizationDemo.explanation.parameter' | 'PluralizationDemo.files.uploaded' | 'PluralizationDemo.fruits.apple' | 'PluralizationDemo.fruits.banana' | 'PluralizationDemo.fruits.label' | 'PluralizationDemo.items' | 'PluralizationDemo.messages' | 'PluralizationDemo.notifications.unread' | 'PluralizationDemo.people' | 'PluralizationDemo.title' | 'TestHotUpdate.message';
//    type _AllTranslationKeysType = typeof _AllTranslationKeys;
//    type _AllMessages = Readonly<Record<string, _MessageSchemeType>>;
//    type DefaultLocaleMessageSchema = _MessageSchemeType;
//    type DefineLocaleMessage = _MessageSchemeType;
//    type Locale =  'en';
// }
declare module 'virtual:vue-i18n-types/messages' {
  import type {ResourceValue,TranslationsPaths,PickupPaths,RemoveIndexSignature,PickupKeys,PickupLocales, ResourcePath, IsEmptyObject,} from "@intlify/core-base";

  import type { DefineLocaleMessage, DefaultLocaleMessageSchema,Locale } from 'vue-i18n';
  // const _AllMessage = ;
  export type AllMessages = Readonly<{"de":{"App":{"menu":["Startseite","Über uns","Kontakt","Hilfe"]},"FileMergingDemo":{"description":"Diese Komponente demonstriert, wie Übersetzungsschlüssel aus mehreren Dateien automatisch zusammengeführt werden","feature":{"autoMerge":"Dateien werden automatisch vom Plugin erkannt und zusammengeführt","hotReload":"Änderungen an Übersetzungsdateien lösen Hot Module Replacement aus","typeCheck":"Alle zusammengeführten Schlüssel behalten vollständige TypeScript-Typprüfung"},"merged":{"success":"{count} Top-Level-Übersetzungs-Namespaces erfolgreich zusammengeführt!","typeSafety":"Jeder Schlüssel hat Autovervollständigungs-Unterstützung in Ihrer IDE"},"title":"Unterstützung für mehrere Dateien"},"Greeting":{"greetings":"unplug-i18n-dts-generation Plugin - Demo Projekt","message":"Hallo TypeScript Freunde!"},"InterpolationDemo":{"birthday":"Nächstes Jahr wirst du {age}!","profile":"{name} ist {age} Jahre alt","welcome":"Willkommen, {name}!"},"LanguageDropdown":{"label":"Sprache:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"E-Mail- und Push-Benachrichtigungen","label":"Benachrichtigungen"},"privacy":{"description":"Wer kann Ihre Daten sehen","label":"Datenschutz-Kontrollen"},"theme":{"description":"Dunkler oder heller Modus","label":"Design-Einstellungen"}},"status":{"error":"Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.","success":"Operation erfolgreich abgeschlossen!","warning":"Bitte überprüfen Sie Ihre Änderungen, bevor Sie fortfahren."}},"PluralizationDemo":{"cart":{"status":"Ihr Warenkorb ist leer | Sie haben einen Artikel im Warenkorb | Sie haben {n} Artikel im Warenkorb"},"explanation":{"format":"Format: 'null | eins | viele'","note":"Der {n}-Wert bestimmt welche Form verwendet wird: 0=erste, 1=zweite, 2+=dritte","parameter":"Übergeben Sie den Parameter {n} mit dem Zählwert"},"files":{"uploaded":"keine Dateien hochgeladen | {n} Datei hochgeladen | {n} Dateien hochgeladen"},"fruits":{"apple":"kein Apfel | ein Apfel | {n} Äpfel","banana":"keine Banane | eine Banane | {count} Bananen","label":"Du hast keine {fruit} | Du hast eine {fruit} | Du hast {count} {fruit}"},"fruitsLabel":"Es gibt keine Früchte | Es gibt eine Frucht | Es gibt {count} Früchte","items":"keine Artikel | ein Artikel | {n} Artikel","messages":"keine Nachrichten | eine Nachricht | {n} Nachrichten","notifications":{"unread":"keine ungelesenen Benachrichtigungen | eine ungelesene Benachrichtigung | {n} ungelesene Benachrichtigungen"},"people":"niemand | {n} Person | {n} Personen","title":"Pluralisierungsbeispiele"}},"en":{"App":{"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}}}>;
   // const _MessageScheme = {"App":{"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}};
      export type MessageSchemeType = AllMessages['en'];

  export type AllTranslationKeys = TranslationsPaths<AllMessages> | 'App.menu' | 'App.menu.0' | 'App.menu.1' | 'App.menu.2' | 'App.menu.3' | 'FileMergingDemo.description' | 'FileMergingDemo.feature.autoMerge' | 'FileMergingDemo.feature.hotReload' | 'FileMergingDemo.feature.typeCheck' | 'FileMergingDemo.merged.success' | 'FileMergingDemo.merged.typeSafety' | 'FileMergingDemo.title' | 'Greeting.greetings' | 'Greeting.message' | 'InterpolationDemo.birthday' | 'InterpolationDemo.profile' | 'InterpolationDemo.welcome' | 'LanguageDropdown.label' | 'NestedKeysDemo.settings.notifications.description' | 'NestedKeysDemo.settings.notifications.label' | 'NestedKeysDemo.settings.privacy.description' | 'NestedKeysDemo.settings.privacy.label' | 'NestedKeysDemo.settings.theme.description' | 'NestedKeysDemo.settings.theme.label' | 'NestedKeysDemo.status.error' | 'NestedKeysDemo.status.success' | 'NestedKeysDemo.status.warning' | 'PluralizationDemo.cart.status' | 'PluralizationDemo.explanation.format' | 'PluralizationDemo.explanation.note' | 'PluralizationDemo.explanation.parameter' | 'PluralizationDemo.files.uploaded' | 'PluralizationDemo.fruits.apple' | 'PluralizationDemo.fruits.banana' | 'PluralizationDemo.fruits.label' | 'PluralizationDemo.items' | 'PluralizationDemo.messages' | 'PluralizationDemo.notifications.unread' | 'PluralizationDemo.people' | 'PluralizationDemo.title' | 'TestHotUpdate.message';
  export type MessageSchemaGen = MessageSchemeType & DefineLocaleMessage;
  export type I18nMessages = AllMessages;
  export type AllTranslations = I18nMessages;
  export type MessagesType = I18nMessages;


  export const messages: MessagesType;
  export {messages as default };
}
declare module 'virtual:vue-i18n-types/availableLocales' {
  import type {PickupLocales } from "@intlify/core-base";

  export type AvailableLocales =  Readonly<['de', 'en']>
  export type AvailableLocale = PickupLocales<AllMessages>
  export const availableLocales : AvailableLocales;
  export default availableLocales;
}
declare module 'virtual:vue-i18n-types' {
   import {type Plugin, type WritableComputedRef} from 'vue';
   import { availableLocales } from 'virtual:vue-i18n-types/availableLocales';
   import type {  Composer, Locale, FallbackLocale, ComposerOptions as Options, ComposerOptions, I18n, I18nOptions,DefaultDateTimeFormatSchema,DefaultNumberFormatSchema, NamedValue, TranslateOptions, UseI18nOptions} from "vue-i18n";
   import type { MessagesType,AllMessages, AllTranslations,AllTranslationKeys,I18nMessages,MessageSchemaGen} from 'virtual:vue-i18n-types/messages';
   export type * from 'virtual:vue-i18n-types/messages';
    export type * from 'virtual:vue-i18n-types/availableLocales';
   import type { AvailableLocale,AvailableLocales} from 'virtual:vue-i18n-types/availableLocales';

   export interface I18nCustom {
     (key: AllTranslationKeys, plural: number, options: TranslateOptions): string
      (key: AllTranslationKeys): string
      (key: AllTranslationKeys, options?: TranslateOptions): string
      (key: AllTranslationKeys, defaultMsg?: string): string
      (key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string
      (key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string
      (key: AllTranslationKeys, named: NamedValue, plural?: number): string
      (key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions & Record<string,string|number>): string
      (key: AllTranslationKeys, plural: number| UnwrapRef<number>, named?: NamedValue<TranslateOptions>): string
      (key: AllTranslationKeys, plural: number, defaultMsg?: string): string
  };


declare module 'vue' {
  import type {NamedValue, TranslateOptions} from "vue-i18n";
  import type {AllTranslationKeys, I18nCustom} from 'virtual:vue-i18n-types';


  /**
   * Component Custom Properties for Vue I18n
   *
   * @VueI18nInjection
   */
  export interface ComponentCustomProperties {

    // $i18n: VueI18nInstance



    $t(key: AllTranslationKeys, plural?: number|TranslateOptions|string|NamedValue, options?: TranslateOptions|string|number): string

  }
}



export type DateTimeFormats = Record<AvailableLocale|string, DefaultDateTimeFormatSchema>
export type NumberFormats = Record<AvailableLocale|string, DefaultNumberFormatSchema>

 export type I18nOptions = Omit<ComposerOptions,'messages'>&
 {
   messages:AllMessages,locale: en,

 };
 export type CreateI18nOptions = Omit<ComposerOptions,'messages'>& I18nOptions &
 {

  lecacy: false,
  dateTimeFormats?: DateTimeFormats,
  numberFormats?: NumberFormats
 };
//   export type DateTimeFormats = DefaultDateTimeFormatSchema
// export type NumberFormats =  DefaultNumberFormatSchema

  export type I18InstanceType<Options extends CreateI18nOptions> = I18n<AllMessages,DateTimeFormats, NumberFormats, AvailableLocale,false>

  export type UseI18nTypesafeReturn<TOptions extends I18nOptions=I18nOptions> = Omit<Composer<AllMessages, NonNullable<TOptions['datetimeFormats']>, NonNullable<TOptions['numberFormats']>, TOptions['locale'] extends unknown ?AvailableLocale: TOptions['locale']>,'t'> &
  {
   t: I18nCustom
   tm: <TKey extends string |PickupPaths<MessageSchemaGen>,TResult extends ResourceValue<MessageSchemaGen, TKey>>(t: TKey) =>  TResult
   locale: WritableComputedRef<AvailableLocale>};


  // export function createI18nInstance<T extends Partial<ComposerOptions> >(options?: T):
  //     I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"]: object, T["locale"] extends string ? T["locale"] : Locale, false>
  type I18nInstance<T extends Omit<ComposerOptions,'messages'>> = I18n<
    MessagesType,
    T['datetimeFormats'] extends Record<string, unknown> ? T['datetimeFormats'] : object,
    T['numberFormats'] extends Record<string, unknown> ? T['numberFormats'] : object,
    T['locale'] extends string ? T['locale'] : Locale,
    false
  >
  export function createI18nInstance<Options extends CreateI18nOptions>(options?: Options): I18InstanceType<Options>;
  export function createI18nInstancePlugin<T extends  CreateI18nOptions>(options?: T):
      Plugin<unknown[]>& I18nInstance<T>

  export {fallbackLocales} from 'virtual:vue-i18n-types/fallbackLocales'
  export {availableLocales} from 'virtual:vue-i18n-types/availableLocales'
  export {messages} from 'virtual:vue-i18n-types/messages'
  export const useI18nApp: ()=> UseI18nTypesafeReturn
  export function useI18nTypeSafe(options?:I18nOptions):UseI18nTypesafeReturn;
}
// declare module '@intlify/core-base' {
//
//   export type DefineCoreLocaleMessage = _AllMessages;
// }
//   import type { Composer, UseI18nOptions,DefaultLocaleMessageSchema, SchemaParams, LocaleParams, VueMessageType } from 'vue-i18n';
// declare module 'vue-i18n' {
  // type messageScheme = {"App":{"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}}
  // export type DefaultLocaleMessageSchema = _MessageSchemeType

  // export type DefineLocaleMessage = _MessageSchemeType
  // export type Locale =  'de' | 'en';
//export type ComposerTranslation
// }


declare module 'virtual:vue-i18n-types/fallbackLocales' {
  import type { Locale } from "vue-i18n";
  export const fallbackLocales: { [locale in string]: Locale[];}
  export default fallbackLocales;
}
declare module 'virtual:vue-i18n-types/createI18nInstance' {
  import type {createI18nInstance as ImportedType} from 'virtual:vue-i18n-types';
  export const createI18nInstance: ImportedType;
  export default createI18nInstance;
}
declare module 'virtual:vue-i18n-types/createI18nInstancePlugin' {
  import type {createI18nInstancePlugin as ImportedType} from 'virtual:vue-i18n-types';
  export const createI18nInstancePlugin: ImportedType;
  export default createI18nInstancePlugin;
}
declare module 'virtual:vue-i18n-types/useI18nTypeSafe' {
  import type {useI18nTypeSafe as ImportedType} from 'virtual:vue-i18n-types'
  export const useI18nTypeSafe: ImportedType
  export default useI18nTypeSafe;
}

// export {};
// declare module '@intlify/core-base' {
//   export interface DefineCoreLocaleMessage {
//     title: string
//     menu: {
//       login: string
//     }
//   }
// }

// declare module 'vue-i18n' {
//
// //  import type { messages } from 'virtual:vue-i18n-types/messages'
//    interface DefineLocaleMessage {
//    //(typeof messages)['de']
//    test: string
//    }
//    export declare type I18nMode = 'composition'
//
//      export = DefineLocaleMessage;
//      export = x
// }
