import type {JSONObject} from '../types'
import {CombinedMessages} from '../core/combined-messages'
import {createBanner} from '../generator'

export interface RenderMessagesTsParams {
  combinedMessages: CombinedMessages<string, JSONObject>;
  banner?: string;
}

export function renderMessagesTs(params: RenderMessagesTsParams): string {
  const {combinedMessages, banner} = params

  const header = createBanner({
    banner,
    contentId: combinedMessages.contentId,
  }).trimEnd()

  const baseLocale = String(combinedMessages.baseLocale)
  const messagesJson = JSON.stringify(combinedMessages.messages, null, 2)
  const languages = combinedMessages.languages.map(quoteString)
  const supportedLanguagesLiteral = `[${languages.join(', ')}]`
  const supportedLanguagesTypeLiteral = `readonly ${supportedLanguagesLiteral}`

  const keys = combinedMessages.keys
  const keyUnion = keys.length > 0
    ? keys.map(quoteString).join(' | ')
    : 'never'

  const body = [
    header,
    `export const baseLocale = ${JSON.stringify(baseLocale)} as const`,
    '',
    `export const messages = ${messagesJson} as const`,
    '',
    `export const supportedLanguages = ${supportedLanguagesLiteral} as const`,
    '',
    `export type AllSupportedLanguages = ${supportedLanguagesTypeLiteral}`,
    'export type SupportedLanguage = AllSupportedLanguages[number]',
    '',
    `export type AllTranslationKeys = ${keyUnion}`,
    '',
    'export type MessageSchemaGen = (typeof messages)[typeof baseLocale]',
    'export type AllTranslations = typeof messages',
    'export type MessagesType = AllTranslations',
    '',
    'export default messages',
  ]

  return `${normalizeNewlines(body.join('\n'))}\n`
}

function quoteString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}
