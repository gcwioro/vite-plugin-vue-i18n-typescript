
    import {isReactive, ref, toValue} from "vue";
    import { createI18n, useI18n } from 'vue-i18n';
    

export const messages = {"de":{"App":{"menu":["Startseite","Über uns","Kontakt","Hilfe"]},"FileMergingDemo":{"description":"Diese Komponente demonstriert, wie Übersetzungsschlüssel aus mehreren Dateien automatisch zusammengeführt werden","feature":{"autoMerge":"Dateien werden automatisch vom Plugin erkannt und zusammengeführt","hotReload":"Änderungen an Übersetzungsdateien lösen Hot Module Replacement aus","typeCheck":"Alle zusammengeführten Schlüssel behalten vollständige TypeScript-Typprüfung"},"merged":{"success":"{count} Top-Level-Übersetzungs-Namespaces erfolgreich zusammengeführt!","typeSafety":"Jeder Schlüssel hat Autovervollständigungs-Unterstützung in Ihrer IDE"},"title":"Unterstützung für mehrere Dateien"},"Greeting":{"greetings":"unplug-i18n-dts-generation Plugin - Demo Projekt","message":"Hallo TypeScript Freunde!"},"InterpolationDemo":{"birthday":"Nächstes Jahr wirst du {age}!","profile":"{name} ist {age} Jahre alt","welcome":"Willkommen, {name}!"},"LanguageDropdown":{"label":"Sprache:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"E-Mail- und Push-Benachrichtigungen","label":"Benachrichtigungen"},"privacy":{"description":"Wer kann Ihre Daten sehen","label":"Datenschutz-Kontrollen"},"theme":{"description":"Dunkler oder heller Modus","label":"Design-Einstellungen"}},"status":{"error":"Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.","success":"Operation erfolgreich abgeschlossen!","warning":"Bitte überprüfen Sie Ihre Änderungen, bevor Sie fortfahren."}},"PluralizationDemo":{"cart":{"status":"Ihr Warenkorb ist leer | Sie haben einen Artikel im Warenkorb | Sie haben {n} Artikel im Warenkorb"},"explanation":{"format":"Format: 'null | eins | viele'","note":"Der {n}-Wert bestimmt welche Form verwendet wird: 0=erste, 1=zweite, 2+=dritte","parameter":"Übergeben Sie den Parameter {n} mit dem Zählwert"},"files":{"uploaded":"keine Dateien hochgeladen | {n} Datei hochgeladen | {n} Dateien hochgeladen"},"fruits":{"apple":"kein Apfel | ein Apfel | {n} Äpfel","banana":"keine Banane | eine Banane | {count} Bananen","label":"Du hast keine {fruit} | Du hast eine {fruit} | Du hast {count} {fruit}"},"fruitsLabel":"Es gibt keine Früchte | Es gibt eine Frucht | Es gibt {count} Früchte","items":"keine Artikel | ein Artikel | {n} Artikel","messages":"keine Nachrichten | eine Nachricht | {n} Nachrichten","notifications":{"unread":"keine ungelesenen Benachrichtigungen | eine ungelesene Benachrichtigung | {n} ungelesene Benachrichtigungen"},"people":"niemand | {n} Person | {n} Personen","title":"Pluralisierungsbeispiele"}},"en":{"App":{"menu":["Home","About","Contact","Term"]},"FileMergingDemo":{"description":"This component demonstrates how translation keys from multiple files are automatically merged together","feature":{"autoMerge":"Files are discovered and merged automatically by the plugin","hotReload":"Changes to any translation file trigger hot module replacement","typeCheck":"All merged keys maintain full TypeScript type checking"},"merged":{"success":"Successfully merged {count} top-level translation namespaces!","typeSafety":"Every key has autocomplete support in your IDE"},"title":"Multi-File Translation Support"},"Greeting":{"greetings":"vite-plugin-vue-i18n-typescript - Demo Project","message":"Hello TypeScript friends!"},"InterpolationDemo":{"birthday":"Next year you'll be {age}!","profile":"{name} is {age} years old","welcome":"Welcome, {name}!"},"LanguageDropdown":{"label":"Language:"},"NestedKeysDemo":{"settings":{"notifications":{"description":"Email and push alerts","label":"Notifications"},"privacy":{"description":"Who can see your data","label":"Privacy Controls"},"theme":{"description":"Dark or light mode","label":"Theme Settings"}},"status":{"error":"An error occurred. Please try again.","success":"Operation completed successfully!","warning":"Please review your changes before proceeding."}},"PluralizationDemo":{"cart":{"status":"Your cart is empty | You have one item in your cart | You have {count} items in your cart"},"explanation":{"format":"Format: 'zero | one | many'","note":"The {count} value determines which form is used: 0=first, 1=second, 2+=third","parameter":"Pass {count} parameter matching the count value"},"files":{"uploaded":"no files uploaded | one file uploaded | {count} files uploaded"},"fruits":{"apple":"apple | apples","banana":"banana | bananas","label":"You have no {fruit} | You have one {fruit} | You have {count} {fruit}"},"items":"no items | one item | {count} items","messages":"no messages | one message | {count} message","notifications":{"unread":"no unread notifications | one unread notification | {n} unread notifications"},"people":"nobody | one person | {count} people","title":"Pluralization Examples"},"TestHotUpdate":{"message":"This is a test for hot module replacement"}}};

export const availableLocales = ['de', 'en'];

export const fallbackLocales = {"de":["de","en"],"en":["en","de","en-US"]};



let cachedMessages = {};
if (import.meta.hot) {
function deepMerge(target, source) {
  if (target === source) return target;
  if (Array.isArray(target) && Array.isArray(source)) return source;
  if (target && source && typeof target === "object" && typeof source === "object" && !Array.isArray(target) && !Array.isArray(source)) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      out[key] = key in target ? deepMerge(target[key], source[key]) : source[key];
    }
    return out;
  }
  return source;
}
function hrmHotUpdate(messages3, data, app, deepMerge3) {
  const i18nModule = app ?? globalThis?.i18nModule?.global;
  if (!i18nModule) {
    console.error("[i18n hotUpdate] No i18n module instance found, skipping update.");
    return;
  }
  if (!data?.messages?.languages?.length && !data?.locale) {
    console.warn("[i18n hotUpdate] No languages found in hot update data, skipping update.", data);
    return;
  }
  if (data.messages) {
    console.debug(`[i18n hotUpdate] Received FULL hot update with ${data.messages.contentId}: ${data.messages.languages.join(",")} for files: ${data.files.join(", ")}`);
    const mergedMessages = data.messages.messages;
    if (i18nModule) {
      data.messages.languages.forEach((locale) => {
        i18nModule.setLocaleMessage(locale, mergedMessages[locale]);
      });
    }
  } else {
    console.trace("[i18n hotUpdate] Received hot update for locale: " + data.locale);
    i18nModule.mergeLocaleMessage(data.locale, data.update);
  }
  const currentLocale = toValue(i18nModule.locale);
  if (!currentLocale) {
    console.warn("[i18n hotUpdate] Current locale is undefined, skipping locale re-assignment.");
    return;
  }
  if (isReactive(i18nModule.locale)) {
    i18nModule.locale.value = currentLocale;
  } else {
    i18nModule.locale = data.locale || currentLocale;
  }
}
  import.meta.hot.on('i18n-update', (data) => {
 cachedMessages = hrmHotUpdate(cachedMessages,data, globalThis.i18nApp.global,deepMerge);

  });
}

export const useI18nApp = () => globalThis.i18nApp.global;

export function translateWrapperFunction(fn) {
  return ((...args) => {
    if (args.length >= 2) {
      const secondArg = args[1];
      console.log(args, typeof secondArg);
      if (typeof secondArg === "number" || typeof secondArg === "string" && !isNaN(parseFloat(secondArg))) {
        const numericValue = parseFloat(secondArg.toString());
        const originalThirdArg = args[2];
        const newThirdArg = typeof originalThirdArg === "object" && originalThirdArg !== null && !Array.isArray(originalThirdArg) ? { ...originalThirdArg, count: numericValue, n: numericValue } : { count: numericValue, n: numericValue };
        const newArgs = [
          args[0],
          // First argument
          //  numericValue,     // Converted second argument
          newThirdArg
          // Modified or created third argument
        ];
        console.log(newThirdArg);
        return fn.apply(this, newArgs);
      }
    }
    return fn.apply(this, args);
  });
}

export function createI18nInstance(options) {
  const i18nApp = createI18n({
    fallbackLocale: fallbackLocales,
    // missingWarn: false,
    // fallbackWarn: false,
    locale: navigator?.language,
    legacy: false,
    ...options,
    messages
  });
  globalThis.i18nApp = i18nApp;
  return i18nApp;
}

export const createI18nInstancePlugin = createI18nInstance;

export function useI18nTypeSafe(options) {
  const { t: originalT, d, n, ...rest } = useI18n({

    ...(options ?? {}),
  });
  return {
    ...rest,
    t: translateWrapperFunction(originalT),
    d,
    n,
  };
}export default messages