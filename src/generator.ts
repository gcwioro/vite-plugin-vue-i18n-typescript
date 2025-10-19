import type {JSONObject} from './types'
import {CombinedMessages} from './core/combined-messages'
import {compileGeneratedModule} from './core/compile-generated-module'
import {renderMessagesTs} from './templates/render-messages'
import {renderRuntimeTs} from './templates/render-runtime'

export interface ModuleArtifact {
  ts: string;
  js: string;
  dts: string;
}

export interface GeneratedModuleArtifacts {
  runtime: ModuleArtifact;
  messages: ModuleArtifact;
  typesContent: string;
}

export interface GenerateArtifactsParams {
  combinedMessages: CombinedMessages<string, JSONObject>;
  banner?: string;
  sourceId?: string;
}

export function createBanner(params: {banner?: string; contentId: string}): string {
  const {banner, contentId} = params

  if (banner) {
    return banner.endsWith('\n') ? banner : `${banner}\n`
  }

  const lines = [
    '/* eslint-disable */',
    '/* prettier-ignore */',
    '// @ts-nocheck',
    '// AUTO-GENERATED FILE. DO NOT EDIT.',
    `// Content-Hash: ${contentId}`,
  ]

  return `${lines.join('\n')}\n\n`
}

export function toTypesContent(params: GenerateArtifactsParams): string {
  const {typesContent} = generateModuleArtifacts(params)
  return typesContent
}

export function generateModuleArtifacts(params: GenerateArtifactsParams): GeneratedModuleArtifacts {
  const {
    combinedMessages,
    banner,
    sourceId = 'virtual:vue-i18n-types',
  } = params

  const bannerText = createBanner({
    banner,
    contentId: combinedMessages.contentId,
  })

  const messagesTs = renderMessagesTs({
    combinedMessages,
    banner: bannerText,
  })

  const runtimeTs = renderRuntimeTs({
    combinedMessages,
    banner: bannerText,
  })

  const {js, dts} = compileGeneratedModule({
    sources: {
      'messages.ts': messagesTs,
      'runtime.ts': runtimeTs,
    },
  })

  const runtimeJsRaw = js['runtime.js']
  const messagesJs = js['messages.js']
  const runtimeDtsRaw = dts['runtime.d.ts']
  const messagesDts = dts['messages.d.ts']

  const runtimeJs = runtimeJsRaw?.replace(/\.\/(messages)\.ts/g, './$1.js')
  const runtimeDts = runtimeDtsRaw?.replace(/\.\/(messages)\.ts/g, './$1.js')

  if (!runtimeJs || !messagesJs || !runtimeDts || !messagesDts) {
    throw new Error('Failed to compile generated runtime/messages modules')
  }

  const moduleImports = extractImports([runtimeDts, messagesDts])
  const ambientRuntime = createAmbientModuleDeclaration({
    moduleId: sourceId,
    dts: runtimeDts,
  })
  const ambientMessages = createAmbientModuleDeclaration({
    moduleId: `${sourceId}/messages`,
    dts: messagesDts,
  })

  const typesContent = normalizeNewlines([
    bannerText.trimEnd(),
    moduleImports,
    ambientRuntime,
    ambientMessages,
  ].filter(Boolean).join('\n\n')) + '\n'

  return {
    runtime: {
      ts: runtimeTs,
      js: runtimeJs,
      dts: runtimeDts,
    },
    messages: {
      ts: messagesTs,
      js: messagesJs,
      dts: messagesDts,
    },
    typesContent,
  }
}

function extractImports(contents: string[]): string {
  const importSet = new Set<string>()

  for (const content of contents) {
    const lines = normalizeNewlines(content).split('\n')
    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        importSet.add(line.trim())
      }
    }
  }

  return Array.from(importSet).join('\n')
}

function createAmbientModuleDeclaration(params: {moduleId: string; dts: string}): string {
  const {moduleId, dts} = params

  const lines = normalizeNewlines(dts).split('\n')
  const bodyLines: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      bodyLines.push('')
      continue
    }
    if (trimmed === 'export {};') {
      continue
    }

    if (trimmed.startsWith('import ')) {
      continue
    }

    let transformed = line
    if (transformed.trim().startsWith('export declare ')) {
      transformed = transformed.replace('export declare ', 'export ')
    } else if (transformed.trim().startsWith('declare ')) {
      transformed = transformed.replace('declare ', '')
    }

    bodyLines.push(transformed)
  }

  const indented = bodyLines
    .map((line) => (line ? `  ${line}` : ''))
    .join('\n')

  return `declare module '${moduleId}' {\n${indented}\n}`
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}
