/* eslint-disable */
/* prettier-ignore */
// @formatter:off
// biome-ignore lint: disable
// AUTO-GENERATED FILE. DO NOT EDIT.
// Content-Hash: 518afda9

export const messages = {
  "de": {
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
  },
  "en": {
    "App": {
      "fruits": {
        "apple": "apple | apples",
        "banana": "banana | bananas",
        "label": "You have no {fruit} | You have one {fruit} | You have {count} {fruit}"
      },
      "menu": [
        "Home",
        "About",
        "Contact",
        "Term"
      ]
    },
    "Greeting": {
      "greetings": "vite-plugin-vue-i18n-types - Demo Project",
      "message": "Hello TypeScript friends!"
    },
    "InterpolationDemo": {
      "birthday": "Next year you'll be {age}!",
      "profile": "{name} is {age} years old",
      "welcome": "Welcome, {name}!"
    },
    "LanguageDropdown": {
      "label": "Language:"
    },
    "NestedKeysDemo": {
      "settings": {
        "notifications": {
          "description": "Email and push alerts",
          "label": "Notifications"
        },
        "privacy": {
          "description": "Who can see your data",
          "label": "Privacy Controls"
        },
        "theme": {
          "description": "Dark or light mode",
          "label": "Theme Settings"
        }
      },
      "status": {
        "error": "An error occurred. Please try again.",
        "success": "Operation completed successfully!",
        "warning": "Please review your changes before proceeding."
      }
    },
    "PluralizationDemo": {
      "cart": {
        "status": "Your cart is empty | You have one item in your cart | You have {count} items in your cart"
      },
      "explanation": {
        "format": "Format: 'zero | one | many'",
        "note": "The {count} value determines which form is used: 0=first, 1=second, 2+=third",
        "parameter": "Pass {count} parameter matching the count value"
      },
      "files": {
        "uploaded": "no files uploaded | one file uploaded | {count} files uploaded"
      },
      "items": "no items | one item | {count} items",
      "messages": "no messages | one message | {count} message",
      "notifications": {
        "unread": "no unread notifications | one unread notification | {n} unread notifications"
      },
      "people": "nobody | one person | {count} people",
      "title": "Pluralization Examples"
    },
    "TestHotUpdate": {
      "message": "This is a test for hot module replacement"
    }
  },
  "fr": {
    "Greeting": {
      "message": "Bonjour TypeScript !"
    }
  }
} as const satisfies Record<string, Record<string, unknown>>;
export const supportedLanguages = ["de", "en", "fr"] as const;
export const baseLocale = "de" as const;

export type AllSupportedLanguages = typeof supportedLanguages;
export type SupportedLanguage = AllSupportedLanguages[number];
export type MessagesType = typeof messages;
export type AllTranslations = MessagesType;
type BaseLocaleKey = Extract<typeof baseLocale, keyof MessagesType>;
type BaseMessages = BaseLocaleKey extends never ? Record<string, unknown> : MessagesType[BaseLocaleKey];
export type MessageSchemaGen = BaseMessages;
export type AllTranslationKeys = "App.fruits.apple" | "App.fruits.banana" | "App.fruits.label" | "App.fruitsLabel" | "App.menu" | "App.menu.0" | "App.menu.1" | "App.menu.2" | "App.menu.3" | "FileMergingDemo.description" | "FileMergingDemo.feature.autoMerge" | "FileMergingDemo.feature.hotReload" | "FileMergingDemo.feature.typeCheck" | "FileMergingDemo.merged.success" | "FileMergingDemo.merged.typeSafety" | "FileMergingDemo.title" | "Greeting.greetings" | "Greeting.message" | "InterpolationDemo.birthday" | "InterpolationDemo.profile" | "InterpolationDemo.welcome" | "LanguageDropdown.label" | "NestedKeysDemo.settings.notifications.description" | "NestedKeysDemo.settings.notifications.label" | "NestedKeysDemo.settings.privacy.description" | "NestedKeysDemo.settings.privacy.label" | "NestedKeysDemo.settings.theme.description" | "NestedKeysDemo.settings.theme.label" | "NestedKeysDemo.status.error" | "NestedKeysDemo.status.success" | "NestedKeysDemo.status.warning" | "PluralizationDemo.cart.status" | "PluralizationDemo.explanation.format" | "PluralizationDemo.explanation.note" | "PluralizationDemo.explanation.parameter" | "PluralizationDemo.files.uploaded" | "PluralizationDemo.items" | "PluralizationDemo.messages" | "PluralizationDemo.notifications.unread" | "PluralizationDemo.people" | "PluralizationDemo.title";

export default messages;
