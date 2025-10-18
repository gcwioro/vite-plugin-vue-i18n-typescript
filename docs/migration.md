# Migration Guide

## From @intlify/unplugin-vue-i18n

Migrating to `unplugin-vue-i18n-dts-generation` takes just a few minutes and gives you better type safety and
performance.

### Why Migrate?

| Feature         | unplugin-vue-i18n-dts-generation | @intlify/unplugin-vue-i18n |
|-----------------|----------------------------------|----------------------------|
| **Type Safety** | ✅ Full autocomplete for all keys | ⚠️ Limited type inference  |
| **Hot Reload**  | ✅ True HMR (no page refresh)     | ❌ Page reloads             |
| **Performance** | ✅ Incremental updates            | ⚠️ Full rebuilds           |
| **Setup**       | ✅ Zero configuration             | ⚠️ Requires configuration  |
| **DX**          | ✅ IDE shows all available keys   | ⚠️ Manual key checking     |

### Step-by-Step Migration

#### 1. Uninstall Old Plugin

```bash
npm uninstall @intlify/unplugin-vue-i18n
```

#### 2. Install New Plugin

```bash
npm install -D unplugin-vue-i18n-dts-generation
```

#### 3. Update Vite Config

```diff
// vite.config.ts
+ /// <reference types="./vite-env-override" />

- import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
+ import i18nDts from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
  plugins: [
    vue(),
-   VueI18nPlugin({
-     include: [path.resolve(__dirname, './src/locales/**')],
-     compositionOnly: true,
-     fullInstall: false
-   })
+   i18nDts({
+     baseLocale: 'en' // Optional: set your primary language
+   })
  ]
})
```

> **Note:** The `/// <reference types="./vite-env-override" />` directive is important for TypeScript to recognize the
> generated types.

#### 4. Update Your Imports

```diff
// main.ts or wherever you setup i18n
- import messages from '@intlify/unplugin-vue-i18n/messages'
+ import messages from 'virtual:unplug-i18n-dts-generation'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages
})
```

#### 5. Start Using Type-Safe Translations

After running `npm run dev`, the plugin will generate type-safe helpers:

```typescript
// In your Vue components
import { useI18nTypeSafe } from '@/i18n/i18n.gen'

const { t } = useI18nTypeSafe()

// Now you get full type safety!
t('welcome')     // ✅ Autocomplete shows all keys
t('welcom')      // ❌ TypeScript error: typo detected
```

### That's It!

Your existing JSON locale files work without any changes. The plugin automatically:

- Discovers your locale files
- Generates TypeScript types
- Provides autocomplete for all keys
- Updates types when you edit JSON files
- Hot reloads translations without page refresh

## Common Migration Scenarios

### Custom Include Paths

If you had custom include paths:

```diff
// Old
- VueI18nPlugin({
-   include: [
-     path.resolve(__dirname, './src/locales/**'),
-     path.resolve(__dirname, './src/modules/**/locales/**')
-   ]
- })

// New
+ i18nDts({
+   include: [
+     'src/locales/**/*.json',
+     'src/modules/**/locales/**/*.json'
+   ]
+ })
```

### Using YAML Files

The new plugin currently only supports JSON files. Convert YAML to JSON:

```bash
# Install converter
npm install -D js-yaml

# Convert script
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const doc = yaml.load(fs.readFileSync('./src/locales/en.yaml', 'utf8'));
fs.writeFileSync('./src/locales/en.json', JSON.stringify(doc, null, 2));
"
```

### Custom Transform Functions

If you were transforming messages:

```typescript
i18nDts({
  transformJson: (json, filePath) => {
    // Your custom transformation
    return transformedJson
  }
})
```

### Runtime-only Build

The new plugin generates all types at build time, so you get the same benefits:

```typescript
// Types are generated, runtime is minimal
import messages from 'virtual:unplug-i18n-dts-generation'
```

## Feature Comparison

### What Stays the Same

- ✅ All your JSON locale files work as-is
- ✅ Vue I18n runtime API unchanged
- ✅ Component usage patterns remain the same
- ✅ Pluralization and interpolation work identically

### What's Better

- ✅ **Type Safety**: Every translation key is type-checked
- ✅ **Performance**: Only changed files are reprocessed
- ✅ **Hot Reload**: True HMR without page refresh
- ✅ **Developer Experience**: Full IDE support with autocomplete
- ✅ **Zero Config**: Works out-of-the-box

### What's Different

- ❌ YAML support (JSON only for now)
- ❌ Custom blocks in SFCs (use JSON files)
- ❌ Message compilation (uses vue-i18n runtime)

## Troubleshooting

### Types Not Generated

Make sure you have the reference directive:

```typescript
/// <reference types="./vite-env-override" />
```

### Can't Find Virtual Module

Check your import matches exactly:

```typescript
import messages from 'virtual:unplug-i18n-dts-generation'
```

### Locale Files Not Found

Check your file structure matches the default pattern (`src/locales/**/*.json`) or configure custom paths:

```typescript
i18nDts({
  include: ['your/custom/path/**/*.json']
})
```

## Need Help?

- 📚 [Configuration Guide](./configuration.md)
- 🔨 [CLI Usage](./cli.md)
- 🧩 [API Reference](./api.md)
- 🐛 [GitHub Issues](https://github.com/gcwioro/unplugin-vue-i18n-dts-generation/issues)
