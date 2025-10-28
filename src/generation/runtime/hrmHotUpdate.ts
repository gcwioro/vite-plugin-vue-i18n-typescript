import {CombinedMessages} from "../../core/combined-messages";

import {Composer, DefaultLocaleMessageSchema as MessagesType, useI18n} from "vue-i18n";
import {JSONObject} from "../../types";


export type  I18nGlobalApp = Composer<MessagesType, Record<string, unknown>, Record<string, unknown>, object, false>
export type I18nApptype = { global: I18nGlobalApp }
declare type globalThisType = { i18nModule: I18nApptype }
declare const availableLocales: string[];
declare const globalThis: globalThisType;

declare function toValue<T>(r: T | { value: T }): T;

declare function isReactive<T>(r: T | { value: T }): r is { value: T };

export type CustomHotFileChangedPayload = {
  locale: string,
  messages: null,
  update: JSONObject,
  timestamp: number
}
export type CustomHotReplaceI18nPayload = {
  locale?: undefined,
  messages: CombinedMessages,
  timestamp: number,
}
export type CustomHotModuleUpdatePayload =
  CustomHotReplaceI18nPayload
  | CustomHotFileChangedPayload;

// export function hrmHotUpdate(messages: Record<string, JSONObject>, data: CustomHotModuleUpdatePayload, app: I18nGlobalApp, deepMerge: (a: any, b: any) => any) {
export function hrmHotUpdate(messages: Record<string, JSONObject>, data: CustomHotReplaceI18nPayload | CustomHotFileChangedPayload, app: I18nGlobalApp, deepMerge: (a: any, b: any) => any) {

  const i18nModule = app ?? globalThis?.i18nModule?.global;

  if (!data?.messages?.languages?.length && !data?.locale) {
    console.warn('[i18n hotUpdate] No languages found in hot update data, skipping update.', data);
    return;
  }

  if (data.messages) {

    console.trace('[i18n hotUpdate] Received FULL hot update with new messages :' + data.messages.contentId);
    // Update the exported messages
    const mergedMessages = Object.assign({}, messages, deepMerge(data.messages.messages, messages));

    // Update the global i18n instance if it exists
    if (i18nModule) {
      // Update messages for all locales
      data.messages.languages.forEach(locale => {
        i18nModule.setLocaleMessage(locale, mergedMessages[locale]);
      });
    }


  } else {
    console.trace('[i18n hotUpdate] Received hot update for locale: ' + data.locale);
    i18nModule.mergeLocaleMessage(data.locale, data.update);
  }


  // Force re-render by updating a reactive property
  const currentLocale = toValue(i18nModule.locale);
  if (!currentLocale) {
    console.warn('[i18n hotUpdate] Current locale is undefined, skipping locale re-assignment.');
    return
  }
  if (isReactive(i18nModule.locale)) {
    i18nModule.locale.value = currentLocale;
  } else {
    // @ts-ignore
    // globalThis.i18nModule = useI18n({useScope: 'global', locale: currentLocale});
    i18nModule.locale = data.locale || currentLocale;
  }


  // Access to ensure reactivity
}

export default hrmHotUpdate;

