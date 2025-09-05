# unplugin-vue-i18n-dts-generation

**A lightweight Vite plugin that generates TypeScript declaration files from Vue I18n locale messages, enabling
type-safe internationalization keys for Vue 3 applications**

This plugin works alongside (and includes) the Vue I18n Vite plugin **@intlify/unplugin-vue-i18n** to keep your
translation keys and messages in sync with TypeScript types.

## Features

- 🚀 Seamless integration with Vue 3 + Vite (wraps @intlify/unplugin-vue-i18n internally)
- 🔄 Automatic generation of .d.ts TypeScript definitions from your i18n message files
- 🎯 Ensures type-safe i18n keys and message structure across your app
- 🔧 Supports hot-reload: watches locale files in development for instant updates
- 📦 Deterministic output (no changing timestamps) for consistent builds
- ⚡ Fast generation with debouncing and caching to minimize overhead

## Prerequisites

- Node.js >= 18.0.0
- Vite >= 4.0.0
- Vue I18n plugin: @intlify/unplugin-vue-i18n >= 1.0.0 (peer dependency)

Ensure you have the above requirements in your project before using this plugin.

## Installation

Install the plugin **as a development dependency** (along with the Vue I18n unplugin peer dependency) using your package
manager:

```bash
# Using npm
npm install -D unplugin-vue-i18n-dts-generation @intlify/unplugin-vue-i18n
```

## Usage

Add the plugin in your Vite configuration (e.g. vite.config.ts). **Note:** You do **not** need to add the Vue I18n
plugin separately – this plugin already includes and configures it internally.

```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
    plugins: [
        vue(),
        // This plugin handles both vue-i18n and type generation
        unpluginVueI18nDtsGeneration(),  // Uses smart defaults out-of-the-box
    ]
})
```

By default, the plugin will automatically discover your locale message files. It looks for files matching common
patterns in your source directory, for example:

- `./src/**/[a-z][a-z].{json,json5,yml,yaml}` (e.g. en.json, de.yaml)
- `./src/**/*-[a-z][a-z].{json,json5,yml,yaml}` (e.g. messages-en.json)
- `./src/**/[a-z][a-z]-*.{json,json5,yml,yaml}` (e.g. en-US.json)

You can organize your translations in one of these patterns and the plugin will include them automatically.

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

For instance, if your locale files are in a custom location or you want to adjust other settings, you can do the
following:

```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import unpluginVueI18nDtsGeneration from 'unplugin-vue-i18n-dts-generation'

export default defineConfig({
    plugins: [
        vue(),
        unpluginVueI18nDtsGeneration({
            // Pass custom options here
            i18nPluginOptions: {
                include: [path.resolve(__dirname, './src/locales/**')], // custom locale file path pattern
                compositionOnly: true,  // example: use composition API only mode for vue-i18n
                // ...any other @intlify/unplugin-vue-i18n options
            },

            // Type generation options:
            dtsPath: 'src/i18n-types/custom-i18n.d.ts', // custom output file (default: src/types/i18n.d.ts)
            baseLocale: 'en',        // base locale for key generation (default: "en")
            watchInDev: true,        // regenerate types on-the-fly in dev (default: true)
            // banner: '...',        // you can add a custom header comment to the generated file
            // transformKeys: keys => keys.filter(...), // custom key post-processing (sorting, filtering, etc.)
        }),
    ]
})
```

In this example, we customized the locale file path (to look under `src/locales/**`), set `compositionOnly: true` to
only support the Composition API mode of Vue I18n, changed the output .d.ts file path, and left other options at their
defaults. You can adjust these as needed for your project.

### Available Options

All options are optional – the plugin comes with sensible defaults. Here is the full set of configuration options you
can use:

```typescript
interface VirtualKeysDtsOptions {

    // Options to pass to the internal @intlify/unplugin-vue-i18n.
    // If not provided, default include patterns are used.
    // @default { include: ['./src/**/[a-z][a-z].{json,json5,yml,yaml}', ...] }
    i18nPluginOptions?: Partial<PluginOptions>

    // The virtual module ID from unplugin-vue-i18n that provides the messages.
    // @default "@intlify/unplugin-vue-i18n/messages"
    // (Usually you don't need to change this.)
    sourceId?: string

    // Which export to read from the virtual module.
    // @default "default"
    exportName?: string

    // Path where the generated .d.ts file should be written.
    // Can be absolute or relative to the Vite project root.
    // @default "src/types/i18n.d.ts"
    dtsPath?: string

    // The base locale to use for generating key paths (keys from this locale will form the union).
    // @default "en"
    baseLocale?: string

    // Banner text to add at the top of the generated file (e.g. to warn not to edit).
    // If not set, a default banner without timestamps is used.
    banner?: string

    // Whether to watch and regenerate on every relevant file change during development.
    // @default true
    watchInDev?: boolean

    // Function to post-process the collected translation keys (e.g. to filter or sort them).
    // @default keys sorted in ascending order, duplicates removed
    transformKeys?: (keys: string[]) => string[]

    // Name for the generated union type of keys (primarily for compatibility with older versions).
    // @default "VirtualKey"
    typeName?: string
}

```

Most users will only need to tweak a few of these. In particular, you might commonly adjust the
`i18nPluginOptions.include` to point to your locale files if they are in non-standard locations, change `dtsPath` if you
prefer a different output path, or set a different `baseLocale` if your base language isn't "en". The rest can typically
remain at their defaults.

## Important Notes

- **No duplicate plugin needed**: This plugin already includes the Vue I18n Vite plugin, so do not add
  @intlify/unplugin-vue-i18n separately in your Vite config.
- **Simply use unpluginVueI18nDtsGeneration()** as shown above.
- **Works out-of-the-box**: The default configuration will find most conventional locale files without any custom setup.
- **Default locale patterns**: By default, it looks for files like `**/en.json`, `**/en-US.yaml`, or
  `**/messages-en.json` (see patterns above). Adjust the `include` option if your files are elsewhere.
- **Customize via i18nPluginOptions**: Any option from @intlify/unplugin-vue-i18n can be passed through the
  `i18nPluginOptions` field to control how locales are loaded (e.g., `include`, `compositionOnly`, etc.)
- **Virtual module name**: Internally, the plugin uses the virtual module ID `"@intlify/unplugin-vue-i18n/messages"` to
  load messages. You normally shouldn't change `sourceId` from the default unless you know what you're doing.
