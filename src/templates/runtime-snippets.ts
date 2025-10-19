export const numericPluralWrapperSnippet = `
function withNumericPluralHandling<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    if (args.length >= 2) {
      const candidate = args[1];
      const numericValue =
        typeof candidate === 'number'
          ? candidate
          : typeof candidate === 'string' && candidate.trim() !== ''
            ? Number(candidate)
            : Number.NaN;

      if (Number.isFinite(numericValue)) {
        const nextArgs = args.slice() as unknown[];
        const rawOptions = args.length > 2 ? args[2] : undefined;
        const options =
          rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)
            ? {...(rawOptions as Record<string, unknown>)}
            : {};

        (options as Record<string, number>).count = numericValue;
        (options as Record<string, number>).n = numericValue;

        nextArgs[1] = numericValue;
        nextArgs[2] = options;

        return fn(...(nextArgs as Parameters<T>));
      }
    }

    return fn(...args);
  }) as T;
}
`;

export const runtimeBootstrapSnippet = `
const fallBackLocales = supportedLanguages.reduce<Record<string, readonly string[]>>((acc, locale) => {
  const chain: string[] = [locale];
  if (locale !== baseLocale) {
    chain.push(baseLocale);
  }
  acc[locale] = chain;
  return acc;
}, {}) as BaseFallbackLocale;

const mutableMessages = messages as unknown as Record<string, MessageSchemaGen>;
let i18nApp: I18nInstance | null = null;

export {fallBackLocales};

export function useI18nApp(): I18nInstance {
  if (!i18nApp) {
    throw new Error('i18n instance has not been created yet. Call createI18nInstance() first.');
  }
  return i18nApp;
}

export function createI18nInstance(options?: Partial<BaseI18nOptions>): I18nInstance {
  const resolvedOptions: BaseI18nOptions = {
    ...((options ?? {}) as BaseI18nOptions),
    fallbackLocale: fallBackLocales,
    locale: typeof navigator !== 'undefined' && navigator.language ? navigator.language : baseLocale,
    messages,
  } as BaseI18nOptions;

  const instance = createI18n(resolvedOptions);
  i18nApp = instance;
  (globalThis as Record<string, unknown>).i18nApp = instance;

  return instance;
}

export function createI18nInstancePlugin(options?: Partial<BaseI18nOptions>): I18nInstance {
  return createI18nInstance(options);
}

export function useI18nTypeSafe(options?: SanitizedUseI18nOptions): UseI18nTypesafeReturn {
  const composer = useI18n<MessageSchemaGen, SupportedLanguage>((options ?? {}) as UseI18nParameters);
  const {t, ...rest} = composer as BaseComposer;
  return {
    ...rest,
    t: withNumericPluralHandling(t),
  } as UseI18nTypesafeReturn;
}
`;

export const runtimeHmrSnippet = `
if (import.meta.hot) {
  import.meta.hot.accept('./messages', (mod) => {
    if (!mod?.messages) {
      return;
    }

    const nextMessages = mod.messages as typeof messages;

    for (const [locale, localeMessages] of Object.entries(nextMessages)) {
      if (locale === 'js-reserved') {
        continue;
      }

      mutableMessages[locale] = localeMessages as MessageSchemaGen;

      if (i18nApp) {
        i18nApp.global.setLocaleMessage(locale, localeMessages as MessageSchemaGen);
      }
    }
  });
}
`;
