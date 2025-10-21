import {CombinedMessages} from "../../core/combined-messages";

import {Composer} from "vue-i18n";
import {JSONObject} from "../../types";
import {MessagesType} from "virtual:unplug-i18n-dts-generation";

export type  I18nGlobalApp = Composer<MessagesType, Record<string, unknown>, Record<string, unknown>, object, false>
export type I18nApptype = { global: I18nGlobalApp }
declare type globalThisType = { i18nModule: I18nApptype }

declare const globalThis: globalThisType;


export function hrmHotUpdate(messages: Record<string, JSONObject>, data: {
  messages: CombinedMessages,
  timestamp: I18nApptype
}, app: I18nGlobalApp, deepMerge: (a: any, b: any) => any) {
  const i18nModule = app ?? globalThis?.i18nModule?.global;
  console.log('[i18n] Received hot update with new messages', data.messages.languages, data.messages.messages[data.messages.languages[0]]);

  // Update the exported messages
  const mergedMessages = Object.assign({}, messages, deepMerge(data.messages.messages, messages));

  // Update the global i18n instance if it exists
  if (i18nModule) {


    // Update messages for all locales
    data.messages.languages.forEach(locale => {

      i18nModule.setLocaleMessage(locale, data.messages.messages[locale]);

    });

    // Force re-render by updating a reactive property
    const currentLocale = i18nModule.locale.value;
    i18nModule.locale.value = currentLocale;

    console.log('[i18n] Messages updated successfully');
  }

  return mergedMessages;
}

export default hrmHotUpdate;

