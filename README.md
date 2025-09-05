# unplugin-vue-i18n-dts-generation

<p align="center">
  <img src="https://img.shields.io/npm/v/unplugin-vue-i18n-dts-generation?style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/unplugin-vue-i18n-dts-generation?style=flat-square" alt="npm downloads" />
  <img src="https://img.shields.io/badge/vite-4.x%20%7C%205.x%20%7C%206.x%20%7C%207.x-blue?style=flat-square" alt="vite compatibility" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
</p>

**Generate TypeScript declaration files for Vue I18n with a lightweight Vite plugin.**

unplugin-vue-i18n-dts-generation works alongside [`@intlify/unplugin-vue-i18n`](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n) to automatically create TypeScript files with both type definitions and runtime exports from virtual i18n modules. The plugin enables type-safe internationalization and localization for Vue 3 applications by keeping translation keys and messages in sync.

## ✨ Features

- 🚀 **Vite 7 Support** - Fully compatible with Vite 4, 5, 6, and 7
- 📂 **Dual File Generation** - Generate separate type definitions and runtime constants files
- 🔄 Automatic TypeScript file generation with both types and runtime exports
- 🎯 Type-safe i18n keys and message structure
- 🔧 Hot-reload support with file watching in development
- 📦 Deterministic output (no timestamps in generated files)
- ⚡ Fast generation with debouncing and caching
- 🔌 Seamless integration with Vue 3 and `@intlify/unplugin-vue-i18n`

## 🚀 What's New in v1.1.0

### Vite 7 Support
Full compatibility with Vite 7's new plugin API, including:
- Enhanced `handleHotUpdate` hook for better HMR
- Proper logger integration
- Improved plugin ordering with `enforce: 'pre'`

### Dual File Generation
Generate separate files for types and runtime constants:
- **Types file** (`.d.ts`) - Pure TypeScript definitions for compile-time type safety
- **Constants file** (`.ts`) - Runtime values with proper typing

## 📋 Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- Vite >= 4.0.0 (including Vite 7)
- `@intlify/unplugin-vue-i18n` >= 1.0.0 (installed as a peer dependency)

## 📦 Installation

```bash
npm install -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

```bash
yarn add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

```bash
pnpm add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

```bash
bun add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

## 🔧 Basic Usage

Add the plugin to your `vite.config.ts`. Note that this plugin **includes** `@intlify/unplugin-vue-i18n` internally:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    vue(),
    // No need to add VueI18nPlugin separately - it's included!
    unpluginVueI18nDtsGeneration(), // Works with sensible defaults!
  ]
})
```

By default, the plugin will look for locale files matching these patterns:
- `./src/**/[a-z][a-z].{json,json5,yml,yaml}` (e.g., `en.json`, `de.yaml`)
- `./src/**/*-[a-z][a-z].{json,json5,yml,yaml}` (e.g., `messages-en.json`)
- `./src/**/[a-z][a-z]-*.{json,json5,yml,yaml}` (e.g., `en-US.json`)

## 🎯 Configuration Options

Generates separate files for better code organization and tree-shaking:

```typescript
unpluginVueI18nDtsGeneration({
  // Generate two separate files
  typesPath: 'src/i18n/i18n.types.d.ts',  // Type definitions only
  constsPath: 'src/i18n/i18n.consts.ts',  // Runtime constants
  baseLocale: 'en',
  watchInDev: true,
})
```

### Complete Configuration

```typescript
interface VirtualKeysDtsOptions {
  /**
   * Options to pass to the internal @intlify/unplugin-vue-i18n plugin.
   * @default { include: ['./src/**/[a-z][a-z].{json,json5,yml,yaml}', ...] }
   */
  i18nPluginOptions?: Partial<PluginOptions>

  /**
   * The virtual module ID from unplugin-vue-i18n.
   * @default "@intlify/unplugin-vue-i18n/messages"
   */
  sourceId?: string

  /**
   * Path for TypeScript type definitions file.
   * @example "src/i18n/i18n.types.d.ts"
   */
  typesPath?: string

  /**
   * Path for runtime constants file.
   * @example "src/i18n/i18n.consts.ts"
   */
  constsPath?: string

  /**
   * Base locale to introspect for key-path generation.
   * @default "en"
   */
  baseLocale?: string

  /**
   * Optional banner comment at the top of generated files.
   */
  banner?: string

  /**
   * Watch and regenerate on file changes in development.
   * @default true
   */
  watchInDev?: boolean
}
```

## 📝 Examples

### Basic Setup

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration({
      typesPath: 'src/i18n/i18n.types.d.ts',
      constsPath: 'src/i18n/i18n.consts.ts'
    })
  ]
})
```

Generated files:

**i18n.types.d.ts** - Pure type definitions:
```typescript
// AUTO-GENERATED FILE. DO NOT EDIT.
export type AllTranslationKeysGen = 'home.title' | 'home.description' | ...
export type SupportedLanguagesGen = readonly ['en', 'de', 'fr']
export type SupportedLanguageUnionGen = SupportedLanguagesGen[number]
export type AllLocaleGen = { /* message structure */ }
export type AllTranslationsGen = Record<SupportedLanguageUnionGen, AllLocaleGen>
```

**i18n.consts.ts** - Runtime values with types and helper functions:
```typescript
// AUTO-GENERATED FILE. DO NOT EDIT.
import { createI18n } from 'vue-i18n'
import type { I18n } from 'vue-i18n'
import _messagesI18n from '@intlify/unplugin-vue-i18n/messages'
import type { AllTranslationsGen, SupportedLanguagesGen, AllTranslationKeysGen } from './i18n.types'

export const supportedLanguages = ['en', 'de', 'fr'] as const satisfies SupportedLanguagesGen
export const messages = { /* actual messages */ } as const
export const messagesI18n = _messagesI18n as unknown as AllTranslationsGen
export const allTranslationKeys: AllTranslationKeysGen[] = [
  'home.title',
  'home.description',
  // ... all keys
]

// Pre-configured i18n instance creator
export function createI18nInstance(options?: Partial<I18nConfigOptions>): I18n<...>

// Type-safe translation function
export function translate(i18n: I18n, key: AllTranslationKeysGen, ...params): string

// Type-safe i18n hook
export function useI18nTypeSafe(i18n?: I18n): { t: TypeSafeTranslate, ... }
```

### Using with Vue I18n

#### Option 1: Use the Pre-configured Instance Creator (Recommended)

```typescript
// src/i18n/index.ts
import { createI18nInstance } from '@/i18n/i18n.consts'

// Create i18n instance with automatic type safety
export const i18n = createI18nInstance({
  locale: localStorage.getItem('locale') ?? 'en',
  fallbackLocale: 'en',
  // Messages are automatically included and typed!
})

// Export for use in components
export const { t, d, n } = i18n.global
```

#### Option 2: Manual Setup

```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import {
    messagesI18n,
  supportedLanguages,
  type AllLocaleGen,
    type SupportedLanguagesGen
} from './i18n.consts'

// Type-safe i18n instance
export const i18n = createI18n<[AllLocaleGen], SupportedLanguagesGen, false>({
  legacy: false,
  locale: supportedLanguages[0],
  fallbackLocale: 'en',
  messages: messagesI18n,
})
```

### Type-Safe Components

#### Using the Type-Safe Hook (Recommended)

```vue
<script setup lang="ts">
import { useI18nTypeSafe } from '@/i18n/i18n.consts'

// Fully type-safe hook with auto-completion
const { t, locale, availableLocales } = useI18nTypeSafe()

// Auto-completion and type checking for all keys!
const title = t('home.title')
const description = t('home.description', { name: 'Vue' })
const count = t('items.count', 5, { item: 'apples' })
</script>

<template>
  <h1>{{ t('home.title') }}</h1>
  <p>{{ description }}</p>
  <span>{{ count }}</span>
</template>
```

#### Using Standard Vue I18n

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AllTranslationKeysGen } from '@/i18n/i18n.types'

const { t } = useI18n()

// Type-safe translation keys
const key: AllTranslationKeysGen = 'home.title'
const translated = t(key)
</script>

<template>
  <h1>{{ t('home.title') }}</h1>
</template>
```

### Custom Locale Paths

```typescript
import path from 'path'

unpluginVueI18nDtsGeneration({
  i18nPluginOptions: {
    include: [
      path.resolve(__dirname, './src/locales/**'),
      path.resolve(__dirname, './src/modules/**/locales/**')
    ],
  },
  typesPath: 'src/types/i18n.d.ts',
  constsPath: 'src/types/i18n.consts.ts'
})
```

## 🔄 Migration Guides

### From v1.0.x to v1.1.x

The plugin is fully backward compatible. To use the new dual file generation:

```typescript
// Old (still works)
unpluginVueI18nDtsGeneration({
  tsPath: 'src/i18n/i18n.gen.ts'
})

// New (recommended)
unpluginVueI18nDtsGeneration({
  typesPath: 'src/i18n/i18n.types.d.ts',
  constsPath: 'src/i18n/i18n.consts.ts'
})
```

### From Separate Plugin Configuration

If you were using both `@intlify/unplugin-vue-i18n` and this plugin separately:

```typescript
// Before
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    VueI18nPlugin({
      include: [path.resolve(__dirname, './src/locales/**')],
    }),
    unpluginVueI18nDtsGeneration(),
  ]
})

// After
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    unpluginVueI18nDtsGeneration({
      i18nPluginOptions: {
        include: [path.resolve(__dirname, './src/locales/**')],
      }
    }),
  ]
})
```

## 🎨 Advanced Features

### Custom Banner

```typescript
unpluginVueI18nDtsGeneration({
  banner: `/**
 * Generated by My Company Build System
 * Do not edit manually
 * @generated
 */`,
  typesPath: 'src/i18n/types.d.ts',
  constsPath: 'src/i18n/consts.ts'
})
```

### Programmatic Usage

You can also use the generation functions directly:

```typescript
import { toTypesContent, toConstsContent } from 'unplugin-vue-i18n-dts-generation'

const typesContent = toTypesContent({
  messages: yourMessages,
  baseLocale: 'en',
  supportedLanguages: ['en', 'de', 'fr'],
  banner: '// Custom banner'
})

const constsContent = toConstsContent({
  messages: yourMessages,
  baseLocale: 'en',
  supportedLanguages: ['en', 'de', 'fr']
})
```

## 🏗️ How It Works

1. **Plugin Integration**: Internally configures and runs `@intlify/unplugin-vue-i18n`
2. **Virtual Module**: Reads i18n messages from the virtual module `@intlify/unplugin-vue-i18n/messages`
3. **Type Extraction**: Analyzes message structure to extract all translation keys
4. **File Generation**: Creates TypeScript files with:
   - Type definitions for all translation keys
   - Runtime constants for supported languages
   - Properly typed message exports
5. **Watch Mode**: In development, watches for locale file changes and regenerates automatically
6. **HMR Support**: Integrates with Vite's HMR for instant updates

## 🧪 Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run in watch mode
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint code
npm run lint
```

### Example Project

```bash
cd example
npm install
npm run dev
```

The example demonstrates:
- Dual file generation
- Type-safe translations with auto-completion
- Pluralization support
- Runtime constant usage
- Vite 7 integration

## 📊 Performance

- **Fast Generation**: Typically < 50ms for medium-sized projects
- **Debounced Updates**: 400ms debounce in watch mode to batch changes
- **Caching**: Content hash-based caching prevents unnecessary writes
- **Deterministic Output**: Consistent output across runs for better git diffs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

## 🐛 Issues

If you find a bug or have a feature request, please open an issue on [GitHub](https://github.com/gcwioro/unplugin-vue-i18n-dts-generation/issues).

## 🙏 Acknowledgments

- Built on top of [`@intlify/unplugin-vue-i18n`](https://github.com/intlify/bundle-tools)
- Inspired by the need for better TypeScript support in Vue I18n projects
- Thanks to all contributors and users of this plugin

---

<p align="center">Made with ❤️ for the Vue.js community</p>
