import {JSONObject} from "../types";
import {fnv1a32, getFinalKeys} from "../utils";

export class CombinedMessages<
  TLanguages extends string = string,
  TMessages extends JSONObject = JSONObject,
> {
  public readonly messagesJsonString: string;
  public readonly keys: string[];
  public readonly baseLocaleMessages: TMessages;
  public readonly languages: TLanguages[];
  public readonly contentId: string;
  public readonly baseLocale: TLanguages;

  public constructor(
    public readonly messages: Record<TLanguages, TMessages>,
    baseLocale: TLanguages,
  ) {
    this.messagesJsonString = JSON.stringify(messages);

    const languages = Object.keys(messages).filter((locale) => locale !== "js-reserved");
    this.languages = Array.from(new Set(languages)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) as TLanguages[];

    const resolvedBaseLocale = (this.languages.includes(baseLocale)
      ? baseLocale
      : this.languages[0]) as TLanguages | undefined;

    this.baseLocale = resolvedBaseLocale ?? baseLocale;

    const fallbackLocale = this.baseLocale in messages ? this.baseLocale : (this.languages[0] as TLanguages | undefined);
    this.baseLocaleMessages = (fallbackLocale ? messages[fallbackLocale] : undefined) ?? ({} as TMessages);

    const keysLocale = fallbackLocale ?? this.baseLocale;
    this.keys = getFinalKeys(messages, keysLocale as keyof typeof messages);

    this.contentId = fnv1a32(this.messagesJsonString);
  }

  public languagesTuple(): string {
    return `['${this.languages.join(`', '`)}']`;
  }
}
