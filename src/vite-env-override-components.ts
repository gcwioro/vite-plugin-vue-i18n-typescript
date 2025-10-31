export {}

import type {NamedValue, TranslateOptions} from "vue-i18n";

type AllTranslationKeys = unknown

declare module 'vue' {


  /**
   * Component Custom Properties for Vue I18n
   *
   * @VueI18nInjection
   */
  export interface ComponentCustomProperties {

    // $i18n: VueI18nInstance

    $t(key: AllTranslationKeys, plural: number, options?: TranslateOptions): string

    $t(key: AllTranslationKeys, plural: number, options?: TranslateOptions): string

    $t(key: AllTranslationKeys): string

    $t(key: AllTranslationKeys, options?: TranslateOptions): string

    $t(key: AllTranslationKeys, defaultMsg?: string): string

    $t(key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string

    $t(key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string

    $t(key: AllTranslationKeys, named: NamedValue, plural?: number): string

    $t(key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions): string

    $t(key: AllTranslationKeys, plural: number, named: NamedValue): string

    $t(key: AllTranslationKeys, plural: number, defaultMsg: string): string
  }
}

