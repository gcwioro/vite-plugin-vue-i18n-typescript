# unplugin-vue-i18n-dts-generation

**A lightweight Vite plugin that generates TypeScript declaration files from JSON locale files, enabling
type-safe internationalization keys for Vue 3 applications**

This plugin automatically scans your locale JSON files, generates TypeScript type definitions, and provides a virtual
module for loading translations at runtime.

## Features

- 🚀 Seamless integration with Vue 3 + Vite
- 🔄 Automatic generation of TypeScript definitions from JSON locale files
- 🎯 Type-safe i18n keys and message structure across your app
- 🔧 Hot-reload support: watches locale files in development for instant updates
- 📦 Deterministic output with content hashing for consistent builds
- ⚡ Fast generation with debouncing and caching to minimize overhead
- 🔒 Virtual module system for runtime locale loading

## Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- Vite >= 4.0.0 or >= 7.0.0
- Vue I18n: @intlify/unplugin-vue-i18n <= 6.0.8 (peer dependency)

Ensure you have the above requirements in your project before using this plugin.

## Installation

Install the plugin **as a development dependency** using your package manager:

```bash
# Using npm
npm install -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n vue-i18n

# Using bun
bun add -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n vue-i18n
```

## Usage

Add the plugin in your Vite configuration (e.g. vite.config.ts):

```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
    plugins: [
        vue(),
        unpluginVueI18nDtsGeneration({
            // Uses smart defaults out-of-the-box
            baseLocale: 'en', // Optional: set your base locale (default: 'de')
        }),
    ]
})
```

By default, the plugin will automatically discover your locale JSON files in `src/locales/**/*.json`. The locale code is
extracted from the filename - for example:

- `en.json` → locale: `en`
- `de.json` → locale: `de`
- `messages.en.json` → locale: `en`

The plugin generates two files:

- `src/i18n/i18n.types.gen.d.ts` - TypeScript type definitions
- `src/i18n/i18n.gen.ts` - Runtime constants and helper functions

### Example: Using in a Vue Component

After adding the plugin and running your dev server, it will generate a TypeScript definitions file (by default at
`src/types/i18n.d.ts`). You can then use the generated types in your Vue components for type-safe internationalization.
For example:

```vue

<script setup lang="ts" >
    import {useI18nTypeSafe} from "@/i18n/i18n.gen.ts";
    import type {AllTranslationKeysGen} from "@/i18n/i18n.types.gen";

    const {t} = useI18nTypeSafe()

// Use a type-safe translation key
const title: AllTranslationKeysGen = 'home.title'
const translatedTitle = t(title)  // `t` is now aware of available keys
</script >
```

In the above example, the `AllTranslationKeysGen` type (automatically generated) ensures that `'home.title'` is a valid
key according to your locale messages. If you mistype a key, TypeScript will error, preventing runtime translation
errors.

### Configuration & Customization

The plugin provides an options API to customize its behavior. You can pass an options object to
`unpluginVueI18nDtsGeneration()` in your Vite config to override things like the locales path, output file location,
base locale, etc.

### Custom Options Example

```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
    plugins: [
        vue(),
        unpluginVueI18nDtsGeneration({
            // Locale file discovery
            include: ['src/locales/**/*.json'],          // default
            exclude: ['**/node_modules/**'],             // default includes many patterns

            // Output paths
            typesPath: 'src/i18n/i18n.types.gen.d.ts',  // default
            constsPath: 'src/i18n/i18n.gen.ts',         // default

            // Base locale for type generation
            baseLocale: 'en',                            // default: 'de'

            // Virtual module configuration
            virtualId: '@unplug-i18n-types-locales',    // default
            sourceId: '@unplug-i18n-types-locales',     // default

            // Runtime options
            exportMessages: false,                       // default - export messages in generated file

            // Customization
            banner: '// Custom header comment',
            debug: false,                                // default - enable debug logging
        }),
    ]
})
```

### Available Options

All options are optional – the plugin comes with sensible defaults. Here are the configuration options:

#### Locale File Discovery

- `include?: string | string[]` - Glob patterns for locale files (default: `['src/locales/**/*.json']`)
- `exclude?: string | string[]` - Glob patterns to exclude (default: node_modules, dist, .git, etc.)
- `getLocaleFromPath?: (absPath: string, root: string) => string | null` - Custom function to extract locale code from
  filename

#### Output Configuration

- `typesPath?: string` - Path for TypeScript definitions file (default: `'src/i18n/i18n.types.gen.d.ts'`)
- `constsPath?: string` - Path for constants/runtime file (default: `'src/i18n/i18n.gen.ts'`)
- `banner?: string` - Custom header comment for generated files

#### Locale Configuration

- `baseLocale?: string` - Base locale for type generation (default: `'de'`)
- `merge?: 'deep' | 'shallow'` - How to merge locale objects (default: `'deep'`)

#### Virtual Module Configuration

- `virtualId?: string` - Virtual module ID (default: `'@unplug-i18n-types-locales'`)
- `sourceId?: string` - Source module ID for imports (default: `'@unplug-i18n-types-locales'`)
- `devUrlPath?: string` - Dev server URL path for locales (default: `'/_virtual_locales.json'`)

#### Runtime Options

- `exportMessages?: boolean` - Export messages in generated constants file (default: `false`)
- `emit?: { fileName?: string; inlineDataInBuild?: boolean }` - Asset emission config

#### Development Options

- `debug?: boolean` - Enable debug logging (default: `false`)
- `transformJson?: (json: unknown, absPath: string) => unknown` - Transform JSON before processing

Most users will only need to adjust `include`, `baseLocale`, `typesPath`, and `constsPath` for their specific project
structure.

## Important Notes

- **JSON-only support**: This plugin currently only supports JSON locale files. Support for YAML and JSON5 may be added
  in the future.
- **Works out-of-the-box**: The default configuration will find locale JSON files in `src/locales/**/*.json` without any
  custom setup.
- **Locale code extraction**: By default, the locale code is extracted from the second-to-last part of the filename (
  e.g., `messages.en.json` → `en`, `de.json` → `de`).
- **Virtual module**: The plugin provides a virtual module `@unplug-i18n-types-locales` that you can import to access
  the locale messages at runtime.
- **Type-safe helpers**: Use the generated `useI18nTypeSafe()` function for type-safe translations in your Vue
  components.
- **Hot reload**: In development mode, changes to locale files automatically trigger type regeneration and hot module
  replacement.
- **Content hashing**: Generated files include a content hash to ensure they are only rewritten when translations
  actually change.
