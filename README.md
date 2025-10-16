# unplugin-vue-i18n-dts-generation

[![npm version](https://img.shields.io/npm/v/unplugin-vue-i18n-dts-generation.svg)](https://www.npmjs.com/package/unplugin-vue-i18n-dts-generation)
[![npm downloads](https://img.shields.io/npm/dm/unplugin-vue-i18n-dts-generation.svg)](https://www.npmjs.com/package/unplugin-vue-i18n-dts-generation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **Type-Safe Vue 3 i18n Plugin** | Generate TypeScript types from JSON locale files | Catch translation errors at
> compile time

**A standalone Vite plugin for Vue 3 that generates TypeScript declaration files from JSON locale files, providing
compile-time type safety for internationalization (i18n) and localization**

This is a **high-performance alternative to @intlify/unplugin-vue-i18n** focusing on type safety, performance, and
developer experience. Perfect for Vue 3 projects using Vite that need type-safe translations with IntelliSense
autocomplete.

### 🎯 Key Benefits

- **Prevent Runtime i18n Errors**: Catch typos and invalid translation keys during TypeScript compilation
- **IntelliSense Autocomplete**: Full IDE support with autocomplete for all translation keys
- **Flexible Project Structure**: Works with both flat file structure (`en.json`, `de.json`) and nested folders
- **High Performance**: Incremental updates, caching, and parallel processing for large projects
- **Zero Config**: Works out-of-the-box with sensible defaults for Vue 3 + Vite projects

### 📖 Common Problems Solved

Are you looking for solutions to these common Vue i18n issues?

- ❌ **"How to get TypeScript autocomplete for vue-i18n translation keys?"** → This plugin auto-generates types
- ❌ **"Catching invalid i18n keys at compile time"** → TypeScript will error on unknown keys
- ❌ **"Type-safe vue-i18n with TypeScript"** → Full type safety with generated union types
- ❌ **"Alternative to @intlify/unplugin-vue-i18n with better performance"** → Optimized for speed
- ❌ **"Vue 3 i18n IntelliSense not working"** → Automatic IDE autocomplete support

---

## 📋 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Type Safety in Action](#type-safety-in-action)
- [Why Choose This Plugin?](#why-choose-this-plugin)
- [Installation](#installation)
- [Configuration Options](#configuration--customization)
- [Performance & Debugging](#performance--debugging)
- [Migration from @intlify/unplugin-vue-i18n](#migration-guide)
- [Examples & Use Cases](#example-using-in-a-vue-component)

---

## ✨ Features

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

## 🚀 Getting Started - Type-Safe Vue 3 i18n in 5 Minutes

This quick start guide shows you how to add compile-time type safety to your Vue 3 + Vite i18n project. Perfect for
migrating from @intlify/unplugin-vue-i18n or starting fresh with vue-i18n.

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

### 🛡️ TypeScript Type Safety in Action - Catch Translation Errors at Compile Time

Once set up, TypeScript will validate all your translation keys and show errors for typos or invalid keys:

```typescript
// ✅ Valid - TypeScript knows this key exists
const msg = t('welcome')

// ❌ TypeScript Error: Argument of type '"welcme"' is not assignable to parameter of type 'AllTranslationKeys'
const msg = t('welcme')  // Typo caught at compile time!

// ✅ Valid - Nested keys work too
const home = t('nav.home')

// ❌ TypeScript Error: Unknown key
const invalid = t('nav.unknown')  // Caught before runtime!
```

Your IDE will also provide autocomplete suggestions for all available translation keys, making development faster and
preventing errors.

### 📁 Flexible File Structure - Flat or Nested Locale Files

The plugin supports both flat file structure (simple projects) and nested folder structure (large-scale apps):

**Flat Structure** (simpler for small projects):

```
src/
  locales/
    en.json
    de.json
    fr.json
```

**Nested Structure** (better for organizing large translation sets):

```
src/
  locales/
    en/
      common.json
      errors.json
      navigation.json
    de/
      common.json
      errors.json
      navigation.json
```

Both structures work automatically - the plugin detects your locale code from filenames and merges multiple files per
locale when needed.

## 🏆 Why Choose This Plugin? - Better Alternative to @intlify/unplugin-vue-i18n

This plugin is a modern alternative to `@intlify/unplugin-vue-i18n` with significant improvements in type safety,
performance, and developer experience:

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
    import type {AllTranslationKeys} from "@/i18n/i18n.types.gen";

    const {t} = useI18nTypeSafe()

// Use a type-safe translation key
    const title: AllTranslationKeys = 'home.title'
const translatedTitle = t(title)  // `t` is now aware of available keys
</script >
```

In the above example, the `AllTranslationKeys` type (automatically generated) ensures that `'home.title'` is a valid
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

## 🔄 Migration Guide - Switching from @intlify/unplugin-vue-i18n

Migrating from `@intlify/unplugin-vue-i18n` to this plugin is straightforward and takes less than 5 minutes.

### Why Migrate?

- ✅ **Better Type Safety**: Get compile-time errors for invalid translation keys
- ✅ **Better Performance**: Incremental updates and caching make it faster for large projects
- ✅ **Better DX**: IDE autocomplete for all translation keys
- ✅ **Simpler Setup**: Zero configuration required for most projects
- ✅ **Flat File Support**: Use simple flat file structure if you prefer

### Migration Steps

**1. Remove old plugin:**

```bash
npm uninstall @intlify/unplugin-vue-i18n
```

**2. Install this plugin:**

```bash
npm install -D unplugin-vue-i18n-dts-generation
```

**3. Update your `vite.config.ts`:**

```diff
- import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
+ import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    vue(),
-   VueI18nPlugin({
-     include: [resolve(__dirname, './src/locales/**')],
-   }),
+   unpluginVueI18nDtsGeneration({
+     baseLocale: 'en', // Set your base locale
+   }),
  ],
})
```

**4. Update your locale imports:**

```diff
- import messages from '@intlify/unplugin-vue-i18n/messages'
+ import messages from 'virtual:unplug-i18n-dts-generation'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
})
```

**5. Start using type-safe translations:**

```typescript
import { useI18nTypeSafe } from '@/i18n/i18n.gen'

const { t } = useI18nTypeSafe()
// TypeScript now autocompletes and validates all keys!
```

**That's it!** Your existing JSON locale files work without any changes. The plugin will automatically detect them and
generate TypeScript types.

### Compatibility Notes

- ✅ All JSON locale files work without modification
- ✅ Nested translation keys are fully supported
- ✅ Parameters in translations (`{name}`, `{count}`, etc.) work as before
- ✅ Pluralization and formatting work with vue-i18n runtime
- ⚠️ YAML locale files need to be converted to JSON

## 📚 Related Technologies & Resources

This plugin works seamlessly with the Vue 3 ecosystem:

- **[Vue 3](https://vuejs.org/)** - The Progressive JavaScript Framework
- **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling
- **[Vue I18n](https://vue-i18n.intlify.dev/)** - Internationalization plugin for Vue.js
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types

### Helpful Resources

- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Plugin Development](https://vitejs.dev/guide/api-plugin.html)
- [Internationalization Best Practices](https://vue-i18n.intlify.dev/guide/essentials/syntax.html)

## 💡 Use Cases & Examples

### When to Use This Plugin

**Perfect for:**

- ✅ Vue 3 projects with TypeScript wanting type-safe i18n
- ✅ Large-scale applications with hundreds of translation keys
- ✅ Teams that want to catch i18n errors during development
- ✅ Projects needing IDE autocomplete for translation keys
- ✅ Applications with flat file structure for locale management

**Also great for:**

- Migrating from @intlify/unplugin-vue-i18n to better type safety
- New Vue 3 projects starting with internationalization
- Existing vue-i18n projects wanting to add TypeScript support
- Projects with complex nested translation structures

### Real-World Example

```typescript
// Without this plugin - No type safety
const message = t('welcom.messge') // Typo! Runtime error

// With this plugin - Compile-time error
const message = t('welcom.messge')
//                 ^^^^^^^^^^^^^^
// Error: Argument of type '"welcom.messge"' is not assignable
// to parameter of type 'AllTranslationKeys'

// Correct usage with autocomplete
const message = t('welcome.message') // ✅ IDE suggests all keys
```

## 🏷️ Keywords & Topics

Vue 3 • Vite • TypeScript • i18n • Internationalization • Localization • Type Safety • Compile-time Validation •
IntelliSense • Autocomplete • Vue I18n • Translation Keys • Multilingual • JSON Locales • DTS Generation • Type
Definitions • Vite Plugin • Vue Plugin • unplugin-vue-i18n alternative • Type-safe translations • Frontend i18n •
Composition API • Options API

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

## 📜 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs and request features
  in [GitHub Issues](https://github.com/gcwioro/unplugin-vue-i18n-dts-generation/issues)
- Submit pull requests to improve the plugin
- Share your use cases and feedback

## 💖 Support

If this plugin helped your project, consider:

- ⭐ Starring the repository on [GitHub](https://github.com/gcwioro/unplugin-vue-i18n-dts-generation)
- 📢 Sharing it with other Vue developers
- 🐛 Reporting bugs to help improve the plugin

---

**Made with ❤️ for the Vue.js community**
