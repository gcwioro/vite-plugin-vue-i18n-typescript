# vite-plugin-vue-i18n-types

[![npm version](https://img.shields.io/npm/v/vite-plugin-vue-i18n-types.svg)](https://www.npmjs.com/package/vite-plugin-vue-i18n-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Stop shipping broken translations!** Get compile-time type safety for your Vue i18n JSON files.

🎮 **[Live Demo](https://gcwioro.github.io/vite-plugin-vue-i18n-types/)** | 📚 **[Documentation](#documentation)** |
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
- 🎯 Zero config needed
- ⚡ Only rebuilds what changed
- 🛠️ Works as Vite plugin, CLI, or API

## Quick Start

### 1. Install

```bash
npm install vue-i18n
npm install -D vite-plugin-vue-i18n-types
```

### 2. Add to Vite

```typescript
/// <reference types="./vite-env-override" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18nTypes from 'vite-plugin-vue-i18n-types'

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
import { useI18nTypeSafe } from '@/i18n/i18n.gen'

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
npx vite-plugin-vue-i18n-types generate
```

### 3. Programmatic API
```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-types/api'

await generateI18nTypes({baseLocale: 'en'})
```

## Virtual Module Imports

The plugin provides two virtual modules for different use cases:

### `virtual:vue-i18n-types/messages`

Import just the translation messages:

```typescript
import messages from 'virtual:vue-i18n-types/messages'

// Use with createI18n
const i18n = createI18n({
    locale: 'en',
    messages
})
```

### `virtual:vue-i18n-types`

Import helper functions for creating i18n instances:

```typescript
import { createI18nInstancePlugin } from 'virtual:vue-i18n-types'

// Auto-configured plugin
app.use(createI18nInstancePlugin())
```

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
+ npm install -D vite-plugin-vue-i18n-types

# 2. Update vite.config.ts
- import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
+ import i18nTypes from 'vite-plugin-vue-i18n-types'

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

See [GitHub repo](https://github.com/gcwioro/vite-plugin-vue-i18n-types).

## License

MIT
