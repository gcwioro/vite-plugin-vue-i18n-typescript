# unplugin-vue-i18n-dts-generation

**A standalone Vite plugin that generates TypeScript declaration files from JSON locale files, enabling
type-safe internationalization keys for Vue 3 applications**

This is an **alternative to @intlify/unplugin-vue-i18n** with an improved approach focusing on type safety, performance,
and simplicity. The plugin automatically scans your locale JSON files (supporting both **flat and nested structures**),
generates TypeScript type definitions that **catch unknown translation key errors at compile time**, and provides a
virtual module for loading translations at runtime. It works independently as a standalone implementation.

## Features

- 🚀 **Seamless integration** with Vue 3 + Vite
- 🔄 **Automatic generation** of TypeScript definitions from JSON locale files
- 🎯 **Compile-time type safety**: Catch unknown translation key errors before runtime
- 📁 **Flexible file structure**: Works with both flat (`en.json`, `de.json`) and nested (`locales/en/messages.json`)
  structures
- 🔧 **Hot-reload support**: watches locale files in development for instant updates
- 📦 **Deterministic output** with content hashing for consistent builds
- ⚡ **High-performance**:
  - Debounced generation (300ms with 2000ms max wait) prevents rebuild storms
  - Incremental updates: only re-reads changed files
  - Cached canonicalization: data normalized once and reused
  - Parallel file operations for faster processing
- 📊 **Performance logging**: detailed timing breakdowns for debugging
- 🔒 **Virtual module system** for runtime locale loading
- 🐛 **Optional virtual file generation** for debugging and inspection

## Getting Started

This guide shows the minimal steps to set up type-safe i18n in your Vue 3 + Vite project.

### 1. Install Dependencies

```bash
# Using npm
npm install vue-i18n
npm install -D unplugin-vue-i18n-dts-generation

# Using bun
bun add vue-i18n
bun add -D unplugin-vue-i18n-dts-generation
```

### 2. Configure Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    vue(),
    unpluginVueI18nDtsGeneration({
      baseLocale: 'en', // Set your base locale
    }),
  ],
})
```

### 3. Create Locale Files

Create JSON locale files in `src/locales/`:

```json
// src/locales/en.json
{
  "welcome": "Welcome to Vue I18n!",
  "greeting": "Hello, {name}!",
  "nav": {
    "home": "Home",
    "about": "About"
  }
}
```

```json
// src/locales/de.json
{
  "welcome": "Willkommen bei Vue I18n!",
  "greeting": "Hallo, {name}!",
  "nav": {
    "home": "Startseite",
    "about": "Über uns"
  }
}
```

### 4. Initialize Vue I18n

Set up Vue I18n in your `main.ts`:

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// Import the generated locale messages
import messages from 'virtual:unplug-i18n-dts-generation'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

### 5. Use in Components with Type Safety

Use the generated type-safe helper in your Vue components:

```vue
<script setup lang="ts">
import { useI18nTypeSafe } from '@/i18n/i18n.gen'

const { t, locale } = useI18nTypeSafe()

// TypeScript will autocomplete and validate these keys!
const welcomeMsg = t('welcome')
const homeLink = t('nav.home')
const greeting = t('greeting', { name: 'Alice' })
</script>

<template>
  <div>
    <h1>{{ welcomeMsg }}</h1>
    <p>{{ greeting }}</p>
    <nav>
      <a href="/">{{ homeLink }}</a>
    </nav>

    <!-- Switch language -->
    <button @click="locale = 'en'">English</button>
    <button @click="locale = 'de'">Deutsch</button>
  </div>
</template>
```

### 6. Run Your App

```bash
npm run dev
# or
bun dev
```

The plugin will automatically:

- Detect your locale files
- Generate TypeScript definitions at `src/i18n/i18n.types.gen.d.ts`
- Generate type-safe helper functions at `src/i18n/i18n.gen.ts`
- Provide autocomplete for all translation keys in your IDE
- Watch for changes and regenerate types automatically

**That's it!** You now have fully type-safe internationalization. TypeScript will catch any typos in translation keys at
compile time.

## Why Choose This Plugin?

This plugin is an alternative to `@intlify/unplugin-vue-i18n` with several improvements:

**Performance**

- **Incremental updates**: Only re-reads changed locale files, not all files on every change
- **Debounced generation**: Prevents rebuild storms during rapid file edits (300ms with 2s max wait)
- **Cached processing**: Translation data is normalized once and reused
- **Parallel operations**: File operations run in parallel for faster processing

**Type Safety**

- **Compile-time validation**: TypeScript will show errors for unknown/mistyped translation keys
- **Zero runtime errors**: Catch typos like `t('welcme')` instead of `t('welcome')` at build time
- **Type-safe helper functions** (`useI18nTypeSafe()`) with full IDE autocomplete
- **Autocomplete support**: Your IDE will suggest all available translation keys as you type

**Developer Experience**

- **Zero configuration**: Works out-of-the-box with sensible defaults
- **Detailed logging**: Performance breakdowns show exactly where time is spent
- **Virtual file debugging**: Optional generation of virtual module as physical file for inspection
- **Hot reload**: Automatic type regeneration on locale file changes

**Simplicity**

- **Standalone implementation**: No dependency on `@intlify/unplugin-vue-i18n`
- **Direct JSON processing**: Reads locale files directly without transform pipelines
- **Flexible file organization**: Supports flat file structure (`src/locales/*.json`) for simpler projects
- **Cleaner architecture**: Modular design with clear separation of concerns

## Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- Vite >= 4.0.0 or >= 7.0.0
- Vue I18n ^11.0.0 (for runtime i18n support)

Ensure you have the above requirements in your project before using this plugin.

## Installation

Install the plugin **as a development dependency** using your package manager:

```bash
# Using npm
npm install -D unplugin-vue-i18n-dts-generation
npm install vue-i18n

# Using bun
bun add -D unplugin-vue-i18n-dts-generation
bun add vue-i18n
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

The plugin generates two required files (and optionally a third):

- `src/i18n/i18n.types.gen.d.ts` - TypeScript type definitions
- `src/i18n/i18n.gen.ts` - Runtime constants and helper functions
- `src/i18n/i18n.virtual.gen.ts` - Virtual module content (optional, for debugging)

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
            virtualFilePath: 'src/i18n/i18n.virtual.gen.ts', // optional - for debugging

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
- `virtualFilePath?: string` - Path for virtual module file (optional, useful for debugging locale data)
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

## Performance & Debugging

### Performance Optimizations

The plugin is designed for optimal performance, especially in large projects:

- **Debounced Generation**: Changes are debounced (300ms) with a max wait of 2000ms to prevent rebuild storms during rapid file edits
- **Incremental Updates**: Only files that have changed (based on modification time) are re-read and re-parsed
- **Cached Canonicalization**: Translation data is normalized once and cached, avoiding repeated processing
- **Parallel File Operations**: File stats and reads are performed in parallel for faster processing
- **Smart File Writing**: Generated files are only written when their content actually changes

### Performance Logging

The plugin provides detailed performance logs to help you understand where time is spent:

```
📖 Read & Group: 17ms (stat: 4ms, read 1/1 files: 1ms, merge: 0ms)
📝 Generated files in 165ms (content: 2ms, write 2/2 files: 163ms) | src/i18n/i18n.types.gen.d.ts, src/i18n/i18n.gen.ts
✅ Rebuild complete (initial) in 184ms (canonicalize: 0ms) | VirtualId: @unplug-i18n-types-locales | Locales: en
```

These logs show:
- File reading and grouping time (with breakdown)
- Content generation and file writing time
- Total rebuild time with canonicalization overhead
- Which files were actually written (e.g., "write 2/2 files" means both files were updated)

### Virtual File Generation

For debugging purposes, you can generate the virtual module as a physical file:

```typescript
unpluginVueI18nDtsGeneration({
    virtualFilePath: 'src/i18n/i18n.virtual.gen.ts', // Generate virtual module as file
})
```

This creates a third file containing all your locale data in a TypeScript format:

```typescript
// src/i18n/i18n.virtual.gen.ts
const messages = {
  "en": {
    "App": {
      "greetings": "Hello!",
      // ... all your translations
    }
  }
} as const;

export default messages;
```

Benefits:
- **Debug**: See exactly what locale data is being used
- **Version Control**: Track changes to translations over time
- **Inspection**: Easily inspect the full translation structure

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
  replacement. Changes are debounced to prevent rebuild storms.
- **Content hashing**: Generated files include a content hash to ensure they are only rewritten when translations
  actually change.
- **Performance**: The plugin uses incremental updates, caching, and parallel processing for optimal performance, even with
  large translation files.
- **Debugging**: Use `virtualFilePath` option to generate the virtual module as a physical file for inspection and debugging.
