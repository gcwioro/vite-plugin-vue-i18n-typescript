# unplugin-vue-i18n-dts-generation

**Generate TypeScript declaration files for Vue I18n with a lightweight Vite plugin.**

unplugin-vue-i18n-dts-generation works alongside [`@intlify/unplugin-vue-i18n`](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n) to automatically create `.d.ts` files from virtual i18n modules. The plugin enables type-safe internationalization and localization for Vue 3 applications by keeping translation keys and messages in sync.

## Features

- 🚀 Seamless integration with Vue 3, Vite, and `@intlify/unplugin-vue-i18n`
- 🔄 Automatic TypeScript definition generation from i18n modules
- 🎯 Type-safe i18n keys and message structure
- 🔧 Hot-reload support with file watching in development
- 📦 Deterministic output (no timestamps in generated files)
- ⚡ Fast generation with debouncing and caching

## Prerequisites

- Node.js >= 18.0.0
- Vite >= 4.0.0
- `@intlify/unplugin-vue-i18n` >= 1.0.0 (installed as a peer dependency)

## Installation

```bash
npm install -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

```bash
yarn add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

```bash
pnpm add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

## Usage

Add the plugin to your `vite.config.ts`. Note that this plugin replaces the need for separate `@intlify/unplugin-vue-i18n` configuration:

```typescript
import { defineConfig } from 'vite'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    // No need to add VueI18nPlugin separately - it's included!
    unpluginVueI18nDtsGeneration(), // Works with sensible defaults!
  ]
})
```

By default, the plugin will look for locale files matching these patterns:
- `./src/**/[a-z][a-z].{json,json5,yml,yaml}` (e.g., `en.json`, `de.yaml`)
- `./src/**/*-[a-z][a-z].{json,json5,yml,yaml}` (e.g., `messages-en.json`)
- `./src/**/[a-z][a-z]-*.{json,json5,yml,yaml}` (e.g., `en-US.json`)

### With Custom Options

```typescript
import path from 'path'

unpluginVueI18nDtsGeneration({
  // Optional: Pass custom unplugin-vue-i18n configuration
  i18nPluginOptions: {
    include: [path.resolve(__dirname, './src/locales/**')], // Custom locale paths
    compositionOnly: true,
    // Any other unplugin-vue-i18n options
  },

  // Type generation options
  dtsPath: 'src/types/i18n.d.ts',  // Custom output path (default: src/types/i18n.d.ts)
  baseLocale: 'en',                 // Your base locale (default: en)
  watchInDev: true,                 // Watch and regenerate in development (default: true)
})
```

## Configuration

### Options

```typescript
interface VirtualKeysDtsOptions {
  /**
   * Options to pass to the internal @intlify/unplugin-vue-i18n plugin.
   * Optional - sensible defaults are provided.
   * @default { include: ['./src/**/[a-z][a-z].{json,json5,yml,yaml}', ...] }
   */
  i18nPluginOptions?: Partial<PluginOptions>

  /**
   * The virtual module ID from unplugin-vue-i18n.
   * @default "@intlify/unplugin-vue-i18n/messages"
   * Usually you don't need to change this.
   */
  sourceId?: string

  /**
   * Which export to read from the virtual module.
   * @default "default"
   */
  exportName?: string

  /**
   * Path where the generated .d.ts file should be written.
   * Can be absolute or relative to Vite root.
   * @default "src/types/i18n.d.ts"
   */
  dtsPath?: string

  /**
   * Base locale to introspect for key-path generation.
   * @default "en"
   */
  baseLocale?: string

  /**
   * Optional banner comment at the top of the generated file.
   * If omitted, a deterministic banner without timestamps is emitted.
   */
  banner?: string

  /**
   * If true, the plugin will re-generate on every relevant file change in dev.
   * @default true
   */
  watchInDev?: boolean

  /**
   * Optional function to post-process the keys (e.g., sort, filter, dedupe).
   * @default Sort ascending and remove duplicates
   */
  transformKeys?: (keys: string[]) => string[]

  /**
   * Name for the generated union type (kept for compatibility).
   * @default "VirtualKey"
   */
  typeName?: string
}
```

## Examples

### Complete Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    vue(),
    // This single plugin handles both i18n and type generation!
    unpluginVueI18nDtsGeneration(), // That's it! Uses smart defaults
  ]
})
```

Or with custom locale paths:

```typescript
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration({
      i18nPluginOptions: {
        include: [path.resolve(__dirname, './src/locales/**')],
      }
    }),
  ]
})
```

### Generated Output

The plugin will generate a TypeScript definition file with the following exports:

```typescript
// src/types/i18n.d.ts
// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated by unplugin-vue-i18n-dts-generation (deterministic)
// Content-Hash: a1b2c3d4

declare const _SupportedLanguages: readonly ['en', 'de', 'fr']
const _messages = { /* your i18n message structure */ } as const

export type AllTranslationKeysGen = 'home.title' | 'home.description' | 'about.title' // ...
export type SupportedLanguagesGen = typeof _SupportedLanguages
export type SupportedLanguageUnionGen = typeof _SupportedLanguages[number]
export type AllTranslationsGen = typeof _messages
```

### Using the Generated Types with Vue I18n

```typescript
// src/i18n.ts
import { createI18n } from 'vue-i18n'
import type { AllTranslationKeysGen, SupportedLanguageUnionGen } from '@/types/i18n'

// Type-safe i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  // Your i18n configuration
})

// In Vue components
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AllTranslationKeysGen } from '@/types/i18n'

const { t } = useI18n()

// Type-safe translation keys
const title: AllTranslationKeysGen = 'home.title'
const translated = t(title)
</script>
```

## How It Works

1. The plugin internally configures and runs `@intlify/unplugin-vue-i18n` with your provided options
2. `unplugin-vue-i18n` loads your locale files and exposes them via a virtual module
3. The type generation component reads that virtual module using Vite's SSR module loading
4. It extracts and normalizes the i18n messages structure from all locales
5. Generates deterministic TypeScript definitions based on the message keys
6. Writes the definitions to the specified file path
7. In development mode, watches for locale file changes and regenerates when needed

## Advanced Usage

### Custom Key Transformation

```typescript
unpluginVueI18nDtsGeneration({
  transformKeys: (keys) => {
    // Filter out certain keys
    const filtered = keys.filter(k => !k.startsWith('internal.'))
    // Sort and dedupe
    return [...new Set(filtered)].sort()
  }
})
```

### Custom Banner

```typescript
unpluginVueI18nDtsGeneration({
  banner: `// Generated by My App Build System
// Do not modify this file manually
`
})
```

### Migration from Separate Plugin Configuration

If you were previously using both `@intlify/unplugin-vue-i18n` and this plugin separately:

**Before:**
```typescript
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
```

**After (simplest - using defaults):**
```typescript
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    unpluginVueI18nDtsGeneration(), // Automatically finds locale files!
  ]
})
```

**After (with custom options):**
```typescript
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

## Important Notes

- This plugin **includes** `@intlify/unplugin-vue-i18n` internally - do not add it separately to your Vite config
- The plugin works out-of-the-box with sensible defaults for locale file discovery
- Default locale patterns: `./src/**/[a-z][a-z].{json,json5,yml,yaml}` and variations
- All `@intlify/unplugin-vue-i18n` options can be customized through the optional `i18nPluginOptions` property
- The virtual module name `@intlify/unplugin-vue-i18n/messages` is used internally and usually doesn't need to be changed

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run in watch mode
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a feature request, please open an issue on [GitHub](https://github.com/your-username/unplugin-vue-i18n-dts-generation/issues).
