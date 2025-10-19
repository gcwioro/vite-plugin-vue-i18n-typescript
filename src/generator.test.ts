import {describe, expect, it} from 'vitest';
import {CombinedMessages} from './core/combined-messages';
import {renderMessagesModule, renderRuntimeModuleTs} from './generator';
import {compileGeneratedProgram} from './core/compile-generated-program';

describe('renderMessagesModule', () => {
  it('includes language metadata and message schema', () => {
    const messages = {
      en: {hello: 'Hello'},
      de: {hello: 'Hallo'},
    };
    const combined = new CombinedMessages(messages, 'en');

    const result = renderMessagesModule({combinedMessages: combined});

    expect(result).toContain('AUTO-GENERATED FILE. DO NOT EDIT.');
    expect(result).toContain("export const messages = {");
    expect(result).toContain('export const supportedLanguages = ["de", "en"] as const;');
    expect(result).toContain('export type AllTranslationKeys = "hello";');
    expect(result).toContain('export default messages;');
  });
});

describe('renderRuntimeModuleTs', () => {
  it('generates runtime helpers with numeric plural handling and HMR wiring', () => {
    const messages = {
      en: {greeting: 'Hello'},
    };
    const combined = new CombinedMessages(messages, 'en');

    const result = renderRuntimeModuleTs({
      combinedMessages: combined,
      sourceId: 'virtual:vue-i18n-types',
    });

    expect(result).toContain('AUTO-GENERATED FILE. DO NOT EDIT.');
    expect(result).toContain("import {createI18n, useI18n} from 'vue-i18n';");
    expect(result).toContain('function withNumericPluralHandling');
    expect(result).toContain('import.meta.hot.accept');
    expect(result).toContain('export type UseI18nTypesafeReturn = Omit<');
  });
});

describe('compileGeneratedProgram', () => {
  it('emits runtime JavaScript and declarations for generated modules', () => {
    const messages = {
      en: {welcome: 'Welcome'},
      fr: {welcome: 'Bienvenue'},
    };
    const combined = new CombinedMessages(messages, 'en');

    const messagesTs = renderMessagesModule({combinedMessages: combined});
    const runtimeTs = renderRuntimeModuleTs({
      combinedMessages: combined,
      sourceId: 'virtual:vue-i18n-types',
    });

    const {runtimeJs, runtimeDts} = compileGeneratedProgram({
      runtimeSource: runtimeTs,
      messagesSource: messagesTs,
    });

    expect(runtimeJs).toContain('export { messages, supportedLanguages, baseLocale };');
    expect(runtimeJs).toContain('function withNumericPluralHandling');
    expect(runtimeDts).toContain('export declare function createI18nInstance');
    expect(runtimeDts).toContain('export type AllTranslationKeys = "welcome";');
  });
});
