/* eslint-disable */
/* prettier-ignore */
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 62c6dc29

declare module 'virtual:vue-i18n-types' {
  import {type Plugin, type WritableComputedRef} from 'vue'
  import type {  Composer,  ComposerOptions as Options,  ComposerOptions,  I18n,  I18nOptions,  Locale, NamedValue, TranslateOptions, UseI18nOptions} from "vue-i18n"
  export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>
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
  // I18n config options (excludes messages as they're provided by the plugin)
  export type I18nConfigOptions = Omit<I18nOptions<MessageSchemaGen, {}, {}, SupportedLanguage, false>, 'messages'>;
  export type UseI18nTypesafeReturn = Omit<Composer<NonNullable<Options['messages']>, NonNullable<Options['datetimeFormats']>, NonNullable<Options['numberFormats']>, Options['locale'] extends unknown ? string : Options['locale']>,'t'> & { t: I18nCustom};
    function createI18nInstance<T extends Partial<ComposerOptions> >(options?: T): I18n<MessagesType, T["datetimeFormats"] extends Record<string, unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"]: object, T["locale"] extends string ? T["locale"] : Locale, false>
    function createI18nInstancePlugin<T extends Partial<ComposerOptions>&I18nOptions >(options?: T): Plugin<unknown[]>&( I18n<AllTranslations, T["datetimeFormats"] extends Record<string,unknown> ? T["datetimeFormats"] : object, T["numberFormats"] extends Record<string, unknown> ? T["numberFormats"] : object, T["locale"] extends string ? T["locale"] : Locale, false> )
  export const useI18nApp: ()=> UseI18nTypesafeReturn
  function useI18nTypeSafe(options?: Omit<UseI18nOptions, 'messages'>):UseI18nTypesafeReturn;
    export {  createI18nInstance,  createI18nInstancePlugin, useI18nTypeSafe };
}
declare module 'virtual:vue-i18n-types/messages' {
  
  export type SupportedLanguage = AllSupportedLanguages[number]
  export const supportedLanguages: SupportedLanguage[] | AllSupportedLanguages = ['de', 'en', 'node'] as const
  export type AllTranslationKeys = 'App.fruits.apple' | 'App.fruits.banana' | 'App.fruits.label' | 'App.fruitsLabel' | 'App.menu' | 'App.menu.0' | 'App.menu.1' | 'App.menu.2' | 'App.menu.3' | 'FileMergingDemo.description' | 'FileMergingDemo.feature.autoMerge' | 'FileMergingDemo.feature.hotReload' | 'FileMergingDemo.feature.typeCheck' | 'FileMergingDemo.merged.success' | 'FileMergingDemo.merged.typeSafety' | 'FileMergingDemo.title' | 'Greeting.greetings' | 'Greeting.message' | 'InterpolationDemo.birthday' | 'InterpolationDemo.profile' | 'InterpolationDemo.welcome' | 'LanguageDropdown.label' | 'NestedKeysDemo.settings.notifications.description' | 'NestedKeysDemo.settings.notifications.label' | 'NestedKeysDemo.settings.privacy.description' | 'NestedKeysDemo.settings.privacy.label' | 'NestedKeysDemo.settings.theme.description' | 'NestedKeysDemo.settings.theme.label' | 'NestedKeysDemo.status.error' | 'NestedKeysDemo.status.success' | 'NestedKeysDemo.status.warning' | 'PluralizationDemo.cart.status' | 'PluralizationDemo.explanation.format' | 'PluralizationDemo.explanation.note' | 'PluralizationDemo.explanation.parameter' | 'PluralizationDemo.files.uploaded' | 'PluralizationDemo.items' | 'PluralizationDemo.messages' | 'PluralizationDemo.notifications.unread' | 'PluralizationDemo.people' | 'PluralizationDemo.title'
  export type AllSupportedLanguages = readonly ['de', 'en', 'node']
  
  // Message structure types
  export type MessageSchemaGen = {
   "App": {
    "fruits": {
     "apple": "kein Apfel | ein Apfel | {n} Äpfel",
     "banana": "keine Banane | eine Banane | {count} Bananen",
     "label": "Du hast keine {fruit} | Du hast eine {fruit} | Du hast {count} {fruit}"
    },
    "fruitsLabel": "Es gibt keine Früchte | Es gibt eine Frucht | Es gibt {count} Früchte",
    "menu": [
     "Startseite",
     "Über uns",
     "Kontakt",
     "Hilfe"
    ]
   },
   "FileMergingDemo": {
    "description": "Diese Komponente demonstriert, wie Übersetzungsschlüssel aus mehreren Dateien automatisch zusammengeführt werden",
    "feature": {
     "autoMerge": "Dateien werden automatisch vom Plugin erkannt und zusammengeführt",
     "hotReload": "Änderungen an Übersetzungsdateien lösen Hot Module Replacement aus",
     "typeCheck": "Alle zusammengeführten Schlüssel behalten vollständige TypeScript-Typprüfung"
    },
    "merged": {
     "success": "{count} Top-Level-Übersetzungs-Namespaces erfolgreich zusammengeführt!",
     "typeSafety": "Jeder Schlüssel hat Autovervollständigungs-Unterstützung in Ihrer IDE"
    },
    "title": "Unterstützung für mehrere Dateien"
   },
   "Greeting": {
    "greetings": "unplug-i18n-dts-generation Plugin - Demo Projekt",
    "message": "Hallo TypeScript Freunde!"
   },
   "InterpolationDemo": {
    "birthday": "Nächstes Jahr wirst du {age}!",
    "profile": "{name} ist {age} Jahre alt",
    "welcome": "Willkommen, {name}!"
   },
   "LanguageDropdown": {
    "label": "Sprache:"
   },
   "NestedKeysDemo": {
    "settings": {
     "notifications": {
      "description": "E-Mail- und Push-Benachrichtigungen",
      "label": "Benachrichtigungen"
     },
     "privacy": {
      "description": "Wer kann Ihre Daten sehen",
      "label": "Datenschutz-Kontrollen"
     },
     "theme": {
      "description": "Dunkler oder heller Modus",
      "label": "Design-Einstellungen"
     }
    },
    "status": {
     "error": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
     "success": "Operation erfolgreich abgeschlossen!",
     "warning": "Bitte überprüfen Sie Ihre Änderungen, bevor Sie fortfahren."
    }
   },
   "PluralizationDemo": {
    "cart": {
     "status": "Ihr Warenkorb ist leer | Sie haben einen Artikel im Warenkorb | Sie haben {n} Artikel im Warenkorb"
    },
    "explanation": {
     "format": "Format: 'null | eins | viele'",
     "note": "Der {n}-Wert bestimmt welche Form verwendet wird: 0=erste, 1=zweite, 2+=dritte",
     "parameter": "Übergeben Sie den Parameter {n} mit dem Zählwert"
    },
    "files": {
     "uploaded": "keine Dateien hochgeladen | {n} Datei hochgeladen | {n} Dateien hochgeladen"
    },
    "items": "keine Artikel | ein Artikel | {n} Artikel",
    "messages": "keine Nachrichten | eine Nachricht | {n} Nachrichten",
    "notifications": {
     "unread": "keine ungelesenen Benachrichtigungen | eine ungelesene Benachrichtigung | {n} ungelesene Benachrichtigungen"
    },
    "people": "niemand | {n} Person | {n} Personen",
    "title": "Pluralisierungsbeispiele"
   }
  }
  export type I18nMessages = Readonly<Record<SupportedLanguage, MessageSchemaGen>>
  export type AllTranslations = I18nMessages
  export type MessagesType = I18nMessages
  export const messages: MessagesType;
  export default messages;
}
