# Release Notes - v1.0.2

## 🎉 vite-plugin-vue-i18n-types v1.0.2

This patch release includes critical bug fixes, improved developer experience, and enhanced test coverage.

## 🐛 Bug Fixes

### Critical Fix: Base Locale Message Resolution

- **Fixed** incorrect base locale message assignment that could cause translation fallback issues
- The plugin now correctly resolves base messages from the appropriate locale object
- This ensures proper message inheritance and fallback behavior

### Additional Fixes

- **Fixed** ESLint configuration for test helpers to ensure consistent code quality
- **Fixed** CI/CD artifact upload paths for improved build reliability

## ✨ Improvements

### Better Debugging Experience

- **Improved** logging behavior - verbose output is now controlled by the `debug` flag
- Reduces console noise during normal operation while preserving detailed logs when debugging
- The `verbose` option is maintained for backward compatibility but maps to `debug` internally
- Enable with: `debug: true` in your plugin configuration

### Enhanced Development Workflow

- **Added** proper file watching for locale patterns in development server
- The plugin now automatically detects new locale files matching your include/exclude patterns
- Improved hot module replacement for faster development iteration

### More Flexible Imports

- **Added** named export `vitePluginVueI18nTypes` alongside the default export
- **New** dedicated plugin export path for cleaner imports
- You can now import the plugin in multiple ways:
  ```typescript
  // Default import (unchanged)
  import i18nTypes from 'vite-plugin-vue-i18n-types'

  // Named import (new)
  import { vitePluginVueI18nTypes } from 'vite-plugin-vue-i18n-types'

  // Direct plugin import (new)
  import { vitePluginVueI18nTypes } from 'vite-plugin-vue-i18n-types/plugin'
  ```

### Robust File Pattern Matching

- **Added** `fast-glob` as a production dependency for more reliable file globbing
- Improves consistency across different operating systems and environments

## 🧪 Test Coverage

- **Added** comprehensive integration tests for development and build modes
- **Added** programmatic API integration tests with full coverage
- **Added** reusable test fixtures and helpers for maintainability
- Test coverage now includes:
    - Type definition regeneration in dev mode
    - WebSocket payload emission for HMR
    - Nested type definition generation
    - Build artifact generation
    - API functionality validation

## 📦 Dependencies

- Added `fast-glob` as a production dependency for improved file pattern matching

## 💡 Migration Guide

This is a backward-compatible patch release with no breaking changes. However, we recommend:

1. **For debugging**: Use `debug: true` instead of `verbose: true` in your configuration (though `verbose` still works)
2. **For imports**: Consider using the new named export for better tree-shaking and clearer intent

## 🙏 Acknowledgments

Thanks to all contributors who helped identify issues and improve the plugin!

---

**Full Changelog**: [v1.0.0...v1.0.2](https://github.com/your-repo/vite-plugin-vue-i18n-types/compare/v1.0.0...v1.0.2)

## Installation

```bash
# npm
npm install vite-plugin-vue-i18n-types@1.0.2

# pnpm
pnpm add vite-plugin-vue-i18n-types@1.0.2

# bun
bun add vite-plugin-vue-i18n-types@1.0.2
```

## Quick Start

```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import {vitePluginVueI18nTypes} from 'vite-plugin-vue-i18n-types'

export default defineConfig({
    plugins: [
        vitePluginVueI18nTypes({
            include: ['src/locales/**/*.json'],
            debug: true // Enable detailed logging when needed
        })
    ]
})
```
