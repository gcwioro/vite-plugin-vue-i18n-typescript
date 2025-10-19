export function createFallbackLocalesSnippet(baseLocale: string): string {
  return `const FALLBACK_LOCALES = supportedLanguages.reduce<Record<SupportedLanguage, SupportedLanguage[]>>((acc: Record<SupportedLanguage, SupportedLanguage[]>, locale: SupportedLanguage) => {
  const chain = new Set<SupportedLanguage>()
  chain.add(locale)
  if (locale !== ${JSON.stringify(baseLocale)}) {
    chain.add(${JSON.stringify(baseLocale)} as SupportedLanguage)
  }
  acc[locale] = Array.from(chain)
  return acc
}, {} as Record<SupportedLanguage, SupportedLanguage[]>)`
}

export function createNumericWrapperSnippet(): string {
  return `function withNumericSecondArg<Fn extends (...args: any[]) => any>(fn: Fn): Fn {
  return ((...args: Parameters<Fn>) => {
    const nextArgs = [...args] as unknown[]
    if (nextArgs.length >= 2) {
      const second = nextArgs[1]
      const numeric = typeof second === 'number'
        ? second
        : typeof second === 'string'
          ? Number.parseFloat(second)
          : Number.NaN
      if (Number.isFinite(numeric)) {
        const third = nextArgs[2]
        const named = third && typeof third === 'object' && !Array.isArray(third)
          ? {...third as Record<string, unknown>}
          : {}
        named.count = numeric
        named.n = numeric
        nextArgs[2] = named
      }
    }
    return fn(...nextArgs as Parameters<Fn>) as ReturnType<Fn>
  }) as Fn
}`
}

export function createLoadSnippet(): string {
  return `export async function load() {
  return messages
}`
}

export function createHotUpdateSnippet(): string {
  return `type ImportMetaHot = {
  hot?: {
    on: (event: string, cb: (payload: {messages: Partial<typeof messages>}) => void) => void;
  };
};

function applyMessagesUpdate(next: Partial<typeof messages>) {
  for (const [locale, value] of Object.entries(next)) {
    if (!value) continue
    ;(mutableMessages as Record<string, unknown>)[locale] = value
  }
}

const hot = (import.meta as ImportMetaHot).hot
if (hot) {
  hot.on('i18n-update', (data: {messages: Partial<typeof messages>}) => {
    applyMessagesUpdate(data.messages)
    const instance = (globalThis as Record<string, unknown>).i18nApp as
      | VueI18nInstance
      | undefined
    if (instance) {
      for (const [locale, value] of Object.entries(data.messages)) {
        if (value) {
          instance.global.setLocaleMessage(locale, value as MessageSchemaGen)
        }
      }
      const current = instance.global.locale.value
      instance.global.locale.value = current
    }
  })
}`
}
