# Programmatic API

Use the TypeScript/JavaScript API directly in your Node.js scripts for maximum control and flexibility.

## Installation

```bash
npm install -D vite-plugin-vue-i18n-typescript
```

## Basic Usage

```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'

const result = await generateI18nTypes({
  baseLocale: 'en',
  verbose: true
})

console.log(`Generated ${result.filesWritten} files`)
console.log(`Locales: ${result.locales.join(', ')}`)
```

## Virtual Module Structure

The plugin generates TypeScript declarations for virtual modules with modular imports:

### Main Module: `virtual:vue-i18n-types`

Exports helper functions and re-exports from sub-modules:

- `useI18nTypeSafe()` - Type-safe composable for components
- `useI18nApp()` - App-level i18n composable
- `createI18nInstance()` - Creates a standard i18n instance
- `createI18nInstancePlugin()` - Creates a Vue plugin with i18n
- `availableLocales` - Array of available locale codes
- `fallbackLocales` - Object with locale fallback chains
- `messages` - The complete messages object for all locales

### Sub-modules (for tree-shaking)

#### `virtual:vue-i18n-types/messages`
- `messages` - The complete messages object for all locales
- `AllTranslationKeys` - Union type of all translation keys
- `MessageSchemaGen` - Structure of the message schema
- Type exports for i18n messages

#### `virtual:vue-i18n-types/availableLocales`

- `availableLocales` - Array of supported locale codes
- `AvailableLocale` - Union type of supported locales
- `AvailableLocales` - Readonly tuple type of locales

#### `virtual:vue-i18n-types/fallbackLocales`

- `fallbackLocales` - Object mapping locales to their fallback chains

## API Reference

### `generateI18nTypes(options)`

Generates TypeScript type definitions from locale JSON files.

#### Parameters

- `options: GenerateTypesOptions` - Configuration options (all optional)

#### Returns

- `Promise<GenerateTypesResult>` - Generation result with statistics

### Type Definitions

#### GenerateTypesOptions

```typescript
interface GenerateTypesOptions {
  // Project Configuration
  root?: string                    // Project root directory (default: current directory)

  // File Discovery
  include?: string | string[]      // Glob patterns for locale files
  exclude?: string | string[]      // Glob patterns to exclude
  getLocaleFromPath?: (path: string, root: string) => string | null

  // Output Configuration
  typesPath?: string               // Type definition output (default: './src/vite-env-override.d.ts')
  virtualFilePath?: string         // Optional physical file for the virtual module
  banner?: string                  // Custom header comment for generated files

  // Locale Configuration
  baseLocale?: string              // Primary locale (default: 'de')
  merge?: 'deep' | 'shallow'       // Merge strategy for locale fragments (default: 'deep')
  transformJson?: (json: unknown, path: string) => unknown

  // Virtual Module
  sourceId?: string                // Virtual module ID (default: 'virtual:vue-i18n-types')
  devUrlPath?: string              // Dev server endpoint for locale data (default: '/_virtual_locales.json')

  // Build Output
  emit?: {
    inlineDataInBuild?: boolean    // Inline locale data into the bundle (default: false)
    emitJson?: boolean             // Emit combined JSON asset during build (default: false)
    fileName?: string              // Output filename when emitJson is enabled (default: 'assets/locales.json')
  }

  // Diagnostics
  debug?: boolean                  // Enable debug logging
  verbose?: boolean                // Verbose console output when using the API/CLI helpers
}
```

#### GenerateTypesResult

```typescript
interface GenerateTypesResult {
  // Statistics
  filesWritten: number       // Number of files written
  totalFiles: number         // Total files checked
  localeFilesCount: number   // Number of locale files processed

  // File Information
  generatedFiles: string[]   // List of generated file paths
  localeFiles: string[]      // List of locale file paths
  locales: string[]          // Detected locale codes

  // Performance Metrics
  durations: {
    content: number          // Time to generate content
    write: number            // Time to write files
    total: number            // Total generation time
  }
}
```

## Examples

### Basic Example

```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'

async function generate() {
  const result = await generateI18nTypes({
    baseLocale: 'en'
  })

  console.log('✅ Types generated successfully!')
}

generate()
```

### Advanced Example with Error Handling

```typescript
import {generateI18nTypes, type GenerateTypesResult} from 'vite-plugin-vue-i18n-typescript/api'
import path from 'path'

async function generateTypes() {
  try {
    const result: GenerateTypesResult = await generateI18nTypes({
      root: path.resolve('./packages/frontend'),
      baseLocale: 'en',
      include: [
        'src/locales/**/*.json',
        'src/modules/**/i18n/*.json'
      ],
      exclude: ['**/*.test.json'],
      typesPath: 'src/types/i18n.gen.d.ts',
      virtualFilePath: 'src/types/i18n.virtual.gen.ts',
      banner: '// Auto-generated by build script',
      merge: 'deep',
      verbose: true,
      debug: process.env.DEBUG === 'true'
    })

    console.log('✅ Type generation successful!')
    console.log(`   Files written: ${result.filesWritten}/${result.totalFiles}`)
    console.log(`   Locales found: ${result.locales.join(', ')}`)
    console.log(`   Generated files:`)
    result.generatedFiles.forEach(file => {
      console.log(`     - ${file}`)
    })
    console.log(`   Performance:`)
    console.log(`     - Content generation: ${result.durations.content}ms`)
    console.log(`     - File writing: ${result.durations.write}ms`)
    console.log(`     - Total time: ${result.durations.total}ms`)

    return result
  } catch (error) {
    console.error('❌ Type generation failed:', error)
    process.exit(1)
  }
}

generateTypes()
```

### Custom Locale Extraction

```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'

await generateI18nTypes({
  getLocaleFromPath: (absPath, root) => {
    // Custom logic to extract locale from path
    // Example: /app/translations/english.json -> 'en'
    const filename = path.basename(absPath, '.json')
    const localeMap = {
      'english': 'en',
      'german': 'de',
      'french': 'fr'
    }
    return localeMap[filename] || null
  }
})
```

### Transform JSON Before Processing

```typescript
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'

await generateI18nTypes({
  transformJson: (json, filePath) => {
    // Add metadata or transform structure
    return {
      ...json,
      _meta: {
        file: filePath,
        timestamp: Date.now()
      }
    }
  }
})
```

### Build Script Integration

```typescript
// scripts/build-i18n.ts
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'
import { build } from 'vite'

async function buildWithI18n() {
  // Generate types first
  console.log('Generating i18n types...')
  const i18nResult = await generateI18nTypes({
    baseLocale: 'en',
    verbose: true
  })

  if (i18nResult.filesWritten === 0) {
    throw new Error('No i18n files were generated')
  }

  // Then run Vite build
  console.log('Building application...')
  await build()

  console.log('✅ Build complete!')
}

buildWithI18n().catch(error => {
  console.error('Build failed:', error)
  process.exit(1)
})
```

## Running Scripts

### With tsx/ts-node

```bash
# Using tsx (recommended)
npx tsx scripts/generate-i18n.ts

# Using ts-node
npx ts-node scripts/generate-i18n.ts
```

### With Node.js

First compile TypeScript:

```bash
tsc scripts/generate-i18n.ts
node scripts/generate-i18n.js
```

### In package.json

```json
{
  "scripts": {
    "build:i18n": "tsx scripts/generate-i18n.ts",
    "prebuild": "npm run build:i18n",
    "ci:types": "tsx scripts/ci-type-check.ts"
  }
}
```

## Use Cases

### CI/CD Pipeline Script

```typescript
// scripts/ci-type-check.ts
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'
import { execSync } from 'child_process'

async function ciTypeCheck() {
  console.log('🔍 CI Type Check Starting...')

  // Generate i18n types
  const result = await generateI18nTypes({
    verbose: true
  })

  if (result.filesWritten === 0) {
    throw new Error('No i18n types generated')
  }

  // Run TypeScript type check
  console.log('Running TypeScript type check...')
  execSync('npx tsc --noEmit', { stdio: 'inherit' })

  console.log('✅ All type checks passed!')
}

ciTypeCheck().catch(error => {
  console.error('❌ CI type check failed:', error)
  process.exit(1)
})
```

### Multi-Package Monorepo

```typescript
// scripts/generate-all-i18n.ts
import {generateI18nTypes} from 'vite-plugin-vue-i18n-typescript/api'
import path from 'path'

const packages = ['app', 'admin', 'shared']

async function generateAllTypes() {
  for (const pkg of packages) {
    console.log(`Generating types for ${pkg}...`)

    await generateI18nTypes({
      root: path.resolve(`./packages/${pkg}`),
      baseLocale: 'en',
      typesPath: 'src/i18n/types.gen.d.ts',
      verbose: false
    })
  }

  console.log('✅ All packages processed!')
}

generateAllTypes()
```

## Using the Generated Virtual Modules

After generating types, you can import and use the virtual modules in your application:

### Basic Component Usage

```typescript
import { useI18nTypeSafe } from 'virtual:vue-i18n-types'

export default defineComponent({
  setup() {
    const { t } = useI18nTypeSafe()

    // Full type safety and autocomplete
    const message = t('welcome.message')

    return { message }
  }
})
```

### Creating i18n Instances

```typescript
import { createI18nInstance, availableLocales } from 'virtual:vue-i18n-types'

// Create a standalone instance
const i18n = createI18nInstance({
  locale: 'en',
  fallbackLocale: 'en'
})

// Check available locales
console.log('Available languages:', availableLocales)
```

### Vue Plugin Setup

```typescript
import { createApp } from 'vue'
import { createI18nInstancePlugin } from 'virtual:vue-i18n-types'
import App from './App.vue'

const app = createApp(App)

// Auto-configured i18n plugin
app.use(createI18nInstancePlugin({
  locale: 'en',
  fallbackLocale: 'en'
}))

app.mount('#app')
```

### Tree-shaking with Sub-modules

```typescript
// Import only what you need
import { messages } from 'virtual:vue-i18n-types/messages'
import { availableLocales } from 'virtual:vue-i18n-types/availableLocales'
import { fallbackLocales } from 'virtual:vue-i18n-types/fallbackLocales'

// Use with external i18n setup
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: fallbackLocales['en'] || 'en',
  messages,
  availableLocales
})
```

## Tips

1. **Use in build scripts** to ensure types are always generated before builds
2. **Add error handling** to catch and report generation failures
3. **Use verbose mode** during development for detailed logs
4. **Generate debug files** with `virtualFilePath` when troubleshooting
5. **Cache results** when processing multiple packages in sequence
6. **Import sub-modules** for better tree-shaking when you don't need all features
7. **Use `useI18nApp()`** for app-level i18n access outside components
