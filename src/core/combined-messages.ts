import {JSONObject} from "../types";
import {fnv1a32, getFinalKeys} from "../utils";

export class CombinedMessages<TLanguages extends string = string, TMessages extends JSONObject = JSONObject> {


  public readonly messagesJsonString: string;
  public readonly keys: string[];
  public readonly baseLocaleMessages: TMessages;
  public readonly languages: TLanguages[];
  public readonly contentId: string;
  public readonly keysId: string;
  public readonly fallbackLocales: { [p: string]: string[] };


  public constructor(public messages: Record<TLanguages, TMessages>, public baseLocale: keyof typeof messages) {
    this.messagesJsonString = JSON.stringify(messages);

    this.keys = getFinalKeys(messages, baseLocale)
    this.baseLocaleMessages = messages?.[baseLocale] ?? Object.values(messages)[0] ?? {} as TMessages;

    const languages = Object.keys(messages);
    this.languages = Array.from(new Set(languages)).sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    ) as TLanguages[];

    this.contentId = fnv1a32(this.messagesJsonString);
    this.keysId = fnv1a32(this.keys.join('|'));
    this.fallbackLocales = CombinedMessages.getFallBackLocales(this.languages);
  }

  public languagesTuple(): string {
    return `['${this.languages.join(`', '`)}']`
  }

  public static getFallBackLocales(langs: string[]) {
    return langs.reduce((acc, locale) => {
      acc[locale] = [locale, locale === 'en' ? undefined : 'en', locale === 'de' ? undefined : 'de'].filter(a => a !== undefined);
      if (locale === 'en') acc[locale] = [...acc[locale], 'en-US'];
      return acc;
    }, {} as {
      [locale in string]: string[];
    });
  }
}
