# vite-plugin-vue-i18n-typescript

[![npm version](https://img.shields.io/npm/v/vite-plugin-vue-i18n-typescript.svg)](https://www.npmjs.com/package/vite-plugin-vue-i18n-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Stop shipping broken translations!** Get compile-time type safety for your Vue i18n JSON files.

🎮 **[Live Demo](https://gcwioro.github.io/vite-plugin-vue-i18n-typescript/)** | 📚 **[Documentation](#documentation)** |
🚀 **[Quick Start](#quick-start)**

## Why This Plugin?

**Without it:** `t('any.random.key')` → ❌ Runtime errors your users see

**With it:** `t('any.random.key')` → ✅ TypeScript error at compile time

```typescript
// ❌ TypeScript catches this typo instantly
t('welcom')  // Error: Did you mean 'welcome'?

// ✅ Full IDE autocomplete for all your translation keys
t('nav.home')  // IDE shows all available keys
```

**Features:**

- 🔥 True hot reload (no page refresh!)
- Built-in debug dashboards when `debug: true`
- Zero config needed with smart glob + batching defaults
- ⚡ Only rebuilds what changed and surfaces key conflicts
- 🛠️ Works as Vite plugin, CLI (` i18n-typescript`), or API

## Quick Start

### 1. Install

```bash
npm install vue-i18n
npm install -D vite-plugin-vue-i18n-typescript
```

### 2. Add to Vite

```typescript
/// <reference types="./vite-env-override" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18nTypes from 'vite-plugin-vue-i18n-typescript'

export default defineConfig({
  plugins: [
    vue(),
    i18nTypes(), // Zero config!
  ],
})
```

### 3. Use Type-Safe Translations

Create your locale JSON files in `src/locales/`:

```json
// src/locales/en.json
{
    "welcome": "Welcome!",
    "nav": {
        "home": "Home"
    }
}
```

Use in components:

```vue
<script setup lang="ts">
import { useI18nTypeSafe } from 'virtual:vue-i18n-types'

const {t} = useI18nTypeSafe()

// TypeScript knows all your keys!
const msg = t('welcome')     // ✅ Autocomplete
const err = t('welcom')      // ❌ TypeScript error
</script>
```

**That's it!** Your translations are now type-safe.

## Documentation

- **📖 [Configuration Guide](./docs/configuration.md)** - All options explained
- **🔨 [CLI Usage](./docs/cli.md)** - For CI/CD and pre-commit hooks
- **🧩 [API Reference](./docs/api.md)** - For custom build scripts
- **🔄 [Migration Guide](./docs/migration.md)** - From @intlify/unplugin-vue-i18n

## Three Ways to Use

### 1. Vite Plugin (Recommended)
```typescript
plugins: [i18nTypes()]  // Auto-generates types during dev
```

### 2. CLI Tool
```bash
npx vite-plugin-vue-i18n-typescript generate
```

### 3. Programmatic API
```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'

await generateI18nTypes({baseLocale: 'en'})
```

## Virtual Module Imports

The plugin provides virtual modules with everything you need:

### Main Module: `virtual:vue-i18n-types`

```typescript
import {
  useI18nTypeSafe,           // Type-safe composable
  createI18nInstance,         // Create i18n instance
  createI18nInstancePlugin,   // Create Vue plugin
  availableLocales,          // Array of locale codes
  fallbackLocales,           // Fallback mappings
  messages                   // All translations
} from 'virtual:vue-i18n-types'

// Use in components
const {t} = useI18nTypeSafe()

// Or create a plugin
app.use(createI18nInstancePlugin())
```

### Sub-modules for Tree-shaking

Import only what you need:

```typescript
// Just the messages
import { messages } from 'virtual:vue-i18n-types/messages'

// Just the available locales
import { availableLocales } from 'virtual:vue-i18n-types/availableLocales'

// Just the fallback chains
import { fallbackLocales } from 'virtual:vue-i18n-types/fallbackLocales'
```

### Debug Dashboards

Enable `debug: true` in your Vite config and visit:

- `/_virtual_locales.json` for the merged locale payload
- `/__locales_debug__` for metadata (hash, files, fallback map)

Perfect for validating generated data without leaving the browser.

## Common Configuration

```typescript
i18nTypes({
  baseLocale: 'en',                      // Your primary language (defaults to 'de')
  include: ['src/locales/**/*.json'],    // Where to find locale files
  // That's usually all you need!
})
```

[See all configuration options →](./docs/configuration.md)

## Migration from @intlify/unplugin-vue-i18n

Takes 2 minutes:

```diff
# 1. Replace package
- npm uninstall @intlify/unplugin-vue-i18n
+ npm install -D vite-plugin-vue-i18n-typescript

# 2. Update vite.config.ts
- import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
+ import i18nTypes from 'vite-plugin-vue-i18n-typescript'

- VueI18nPlugin({ include: './src/locales/**' })
+ i18nTypes()

# 3. Update imports
- import messages from '@intlify/unplugin-vue-i18n/messages'
+ import messages from 'virtual:vue-i18n-types/messages'
```

Your JSON files work without changes!

## Comparison

| Feature        | This Plugin           | @intlify/unplugin-vue-i18n |
|----------------|-----------------------|----------------------------|
| Type-safe keys | ✅ Full autocomplete   | ⚠️ Limited                 |
| True HMR       | ✅ No page reload      | ❌ Page reloads             |
| Setup          | ✅ Zero config         | ⚠️ Requires configuration  |
| Performance    | ✅ Incremental updates | ⚠️ Full rebuilds           |

## What's New (v1.2.0)

### New Features

- **Merge-export CLI** - Ship locale snapshots via ` i18n-typescript merge-export`, including per-locale splits.
- **Live debug dashboards** - Hit `/_virtual_locales.json` or `/__locales_debug__` when `debug: true` to inspect data.
- **Batch tuning** - Control large projects with the new `fileBatchSize` option.
- **Automatic conflict alerts** - The generator now flags duplicate keys during rebuilds.

### Breaking Changes ⚠️

- `emit.emitJson` now defaults to `true` so builds emit `assets/locales.json` unless disabled.
- Local installs expose the ` i18n-typescript` binary (use `npx vite-plugin-vue-i18n-typescript generate` for one-off
  runs).

## FAQ

<details>
<summary><strong>Where do locale files go?</strong></summary>

Default: `src/locales/*.json`. Change with `include` option.
</details>

<details>
<summary><strong>Can I use YAML?</strong></summary>

Not yet - convert to JSON first.
</details>

<details>
<summary><strong>How to debug?</strong></summary>

```typescript
i18nTypes({
    debug: true,
    virtualFilePath: 'src/debug.gen.ts' // Creates inspectable file
})
```

</details>

## Requirements

- Node.js >= 20.19.0 or >= 22.12.0
- Vite >= 4.0.0 or >= 7.0.0
- Vue 3 with vue-i18n

## Contributing

See [GitHub repo](https://github.com/gcwioro/vite-plugin-vue-i18n-typescript).

## License

MIT
