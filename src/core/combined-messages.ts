import {JSONObject} from "../types";
import {fnv1a32, getFinalKeys} from "../utils";

export class CombinedMessages<TLanguages extends string = string, TMessages extends JSONObject = JSONObject> {


  public readonly messagesJsonString: string;
  public readonly keys: string[];
  public readonly baseLocaleMessages: TMessages;
  public readonly languages: TLanguages[];
  public readonly contentId: string;


  public constructor(public messages: Record<TLanguages, TMessages>, public baseLocale: keyof typeof messages) {
    this.messagesJsonString = JSON.stringify(messages);

    this.keys = getFinalKeys(messages, baseLocale)
    this.baseLocaleMessages = messages?.[baseLocale] ?? Object.values(messages)[0] ?? {} as TMessages;

    const languages = Object.keys(messages);
    this.languages = Array.from(new Set(languages)).sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    ) as TLanguages[];

    this.contentId = fnv1a32(this.messagesJsonString);
  }

  public languagesTuple(): string {
    return `['${this.languages.join(`', '`)}']`
  }
}
