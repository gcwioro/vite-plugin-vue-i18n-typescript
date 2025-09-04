import {type AllTranslationKeysGen} from "./i18n/i18n.gen";
import {i18n} from "./i18n";

type TranslateParams = (string | number | undefined | null) | Record<string, unknown>

export function translate(key: AllTranslationKeysGen): string
export function translate(key: AllTranslationKeysGen, params: TranslateParams): string
export function translate(key: AllTranslationKeysGen, count: number, params: TranslateParams): string
export function translate(key: AllTranslationKeysGen, count: Record<string, unknown>, params: string): string
export function translate<TP2 = TranslateParams | never | string, TP1 = TP2 extends never ? TranslateParams : number>(key: AllTranslationKeysGen, p1?: TP1, p2?: TP2): string {
  if (p2 && p1) return i18n.t(key, p1 as number, p2) as string
  if (p1 && !p2) return i18n.t(key, p1 as Record<string, unknown>) as string
  return i18n.t(key) as string
}

export function useI18nTypeSafe()
{
  return {...i18n,


    t: translate,
  }
}
