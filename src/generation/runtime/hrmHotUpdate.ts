import {CombinedMessages} from "../../core/combined-messages";

import {ComposerOptions} from "vue-i18n";
import {JSONObject} from "../../types";

// import deepMergeFunction from './../../utils/merge.ts??inline';


export function hrmHotUpdate(messages: Record<string, JSONObject>, data: {
  messages: CombinedMessages,
  timestamp: number
}, app?: Partial<ComposerOptions>, deepMerge: (a: any, b: any) => any) {
// @ts-expect-error globalThis i18nModule not typed
  const i18nModule = app || globalThis.i18nModule;
  console.log('[i18n] Received hot update with new messages', data.messages.languages, data.messages.messages[data.messages.languages[0]]);

  // Update the exported messages
  const mergedMessages = Object.assign({}, messages, deepMerge(data.messages.messages, messages));

  // Update the global i18n instance if it exists
  if (i18nModule) {


    // Update messages for all locales
    data.messages.languages.forEach(locale => {

      i18nModule.global.setLocaleMessage(locale, data.messages.messages[locale]);

    });

    // Force re-render by updating a reactive property
    const currentLocale = i18nModule.global.locale.value;
    i18nModule.global.locale.value = currentLocale;

    console.log('[i18n] Messages updated successfully');
  }

  return mergedMessages;
}

export default hrmHotUpdate;

