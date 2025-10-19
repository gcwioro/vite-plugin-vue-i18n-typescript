import type {JSONObject} from '../types'
import {CombinedMessages} from '../core/combined-messages'
import {createBanner} from '../generator'
import {
  createFallbackLocalesSnippet,
  createHotUpdateSnippet,
  createLoadSnippet,
  createNumericWrapperSnippet,
} from './runtime-snippets'

export interface RenderRuntimeTsParams {
  combinedMessages: CombinedMessages<string, JSONObject>;
  banner?: string;
}

export function renderRuntimeTs(params: RenderRuntimeTsParams): string {
  const {combinedMessages, banner} = params

  const header = createBanner({
    banner,
    contentId: combinedMessages.contentId,
  }).trimEnd()

  const baseLocale = String(combinedMessages.baseLocale)

  const sections = [
    header,
    "import {createI18n, useI18n} from 'vue-i18n'",
    "import type {Composer, DefineDateTimeFormat, DefineNumberFormat, FallbackLocale, I18n, I18nOptions, Locale, NamedValue, TranslateOptions, UseI18nOptions} from 'vue-i18n'",
    "import messages, {baseLocale, supportedLanguages} from './messages.ts'",
    "import type {AllTranslationKeys, MessageSchemaGen, MessagesType, SupportedLanguage} from './messages.ts'",
    '',
    createFallbackLocalesSnippet(baseLocale),
    '',
    'type WritableMessages = {',
    "  -readonly [Locale in keyof typeof messages]: {",
    "    -readonly [Key in keyof typeof messages[Locale]]: typeof messages[Locale][Key];",
    '  };',
    '};',
    '',
    'const mutableMessages = messages as WritableMessages;',
    '',
    createNumericWrapperSnippet(),
    '',
    'export type TranslateParams = (string | number | undefined | null) | Record<string, unknown>;',
    '',
    'export interface I18nCustom {',
    '  (key: AllTranslationKeys, plural: number, options?: TranslateOptions): string;',
    '  (key: AllTranslationKeys, options?: TranslateOptions): string;',
    '  (key: AllTranslationKeys, defaultMsg?: string): string;',
    '  (key: AllTranslationKeys, defaultMsg: string, options?: TranslateOptions): string;',
    '  (key: AllTranslationKeys, named: NamedValue, defaultMsg?: string): string;',
    '  (key: AllTranslationKeys, named: NamedValue, plural?: number): string;',
    '  (key: AllTranslationKeys, named: NamedValue, options?: TranslateOptions): string;',
    '  (key: AllTranslationKeys, plural: number, named: NamedValue): string;',
    '  (key: AllTranslationKeys, plural: number, defaultMsg: string): string;',
    '}',
    '',
    'type DateTimeSchema = Record<string, DefineDateTimeFormat>;',
    'type NumberSchema = Record<string, DefineNumberFormat>;',
    'type SchemaDefinition = {',
    '  message: MessageSchemaGen;',
    '  datetime: DateTimeSchema;',
    '  number: NumberSchema;',
    '};',
    'type DateTimeFormatsMap = Record<SupportedLanguage, DateTimeSchema>;',
    'type NumberFormatsMap = Record<SupportedLanguage, NumberSchema>;',
    '',
    'type VueI18nInstance = I18n<MessagesType, DateTimeFormatsMap, NumberFormatsMap, SupportedLanguage, false>;',
    'type ComposerInstance = Composer<MessagesType, DateTimeFormatsMap, NumberFormatsMap, SupportedLanguage>;',
    '',
    'export type I18nConfigOptions = I18nOptions<SchemaDefinition, SupportedLanguage>;',
    'type UseI18nSchema = UseI18nOptions<SchemaDefinition, SupportedLanguage>;',
    '',
    "export type UseI18nTypesafeReturn = Omit<ComposerInstance, 't'> & { t: I18nCustom };",
    '',
    'export function createI18nInstance<T extends Partial<I18nConfigOptions>>(options?: T) {',
    "  const locale = options?.locale ?? (typeof navigator !== 'undefined' && navigator.language ? navigator.language : baseLocale);",
    '  const typedOptions: I18nConfigOptions = {',
      '    legacy: false,',
      '    fallbackLocale: FALLBACK_LOCALES as FallbackLocale,',
      '    locale: locale as SupportedLanguage,',
      '    messages,',
      '    ...(options ?? {}),',
      '  };',
    '  const i18n = createI18n(typedOptions as I18nConfigOptions & { legacy: false; messages: MessagesType });',
    '  const instance = i18n as unknown as VueI18nInstance;',
    "  (globalThis as Record<string, unknown>).i18nApp = instance;",
    '  return instance;',
    '}',
    '',
    'export function createI18nInstancePlugin<T extends Partial<I18nConfigOptions>>(options?: T): VueI18nInstance {',
    '  return createI18nInstance(options);',
    '}',
    '',
    "export function useI18nTypeSafe(options?: Omit<UseI18nSchema, 'messages'>): UseI18nTypesafeReturn {",
    '  const composer = useI18n({',
    '    ...(options ?? {}),',
    '    messages,',
    '  } as UseI18nSchema) as unknown as ComposerInstance;',
    '  const {t, ...rest} = composer;',
    '  return {',
    '    ...rest,',
    '    t: withNumericSecondArg(t),',
    '  };',
    '}',
    '',
    createLoadSnippet(),
    '',
    'export {messages, supportedLanguages};',
    'export {baseLocale};',
    '',
    createHotUpdateSnippet(),
    '',
    'export default messages;',
  ]

  return `${normalizeNewlines(sections.join('\n'))}\n`
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}
