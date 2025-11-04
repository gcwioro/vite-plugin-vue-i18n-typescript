# Release Notes - v1.2.0

## Highlights

- **`merge-export` CLI command** ships merged or per-locale JSON dumps straight from your locales directory.
- **Live debug dashboards** expose `/_virtual_locales.json` and `/__locales_debug__` when `debug: true` to inspect
  runtime data.
- **Configurable batching** via the new `fileBatchSize` option keeps huge repositories responsive.
- **Automatic conflict detection** warns when two locale files define the same key differently.

## New Features

### CLI: `merge-export`

- Export all locales into a single JSON file or split them per locale with the `{locale}` placeholder.
- Shares include/exclude filters with the generator so CI workflows stay consistent.
- Supports `--split`, `--output`, and verbose debug logging for audits.
- Invoke as `i18n-typescript merge-export` in local scripts or `npx vite-plugin-vue-i18n-typescript merge-export` for
  one-off runs.

### Debug Middleware

- When the plugin runs with `debug: true`, Vite serves:
    - `/_virtual_locales.json` containing the merged locale payload.
    - `/__locales_debug__` with metadata (hashes, processed files, fallback mapping).
- Useful for validating generated data without digging through the virtual module.

### Generation Controls

- `fileBatchSize` limits how many files are processed per batch, preventing long rebuild pauses on large monorepos.
- Conflict detection logs precise key paths so you can fix divergent translations quickly.

## ⚙️ Improvements

- Locale asset emission options were removed, so builds rely solely on the virtual module output.
- Additional debug logging captures file discovery patterns and rebuild durations to simplify troubleshooting.

## Notes

- The installed binary is now named `i18n-typescript`. Update local scripts (e.g., `package.json` commands) to call
  `i18n-typescript` instead of `vite-plugin-vue-i18n-typescript`. For ad-hoc runs with `npx`, continue using
  `npx vite-plugin-vue-i18n-typescript generate`.
- Review any build scripts that consumed the emitted JSON asset and replace them with reads from the virtual module or
  source files.

## Recommended Validation

1. Run `npx vite-plugin-vue-i18n-typescript generate --verbose` once to confirm everything still executes in your CI (or
   `pnpm i18n-typescript generate` if installed locally).
2. Visit `http://localhost:<port>/_virtual_locales.json` after enabling `debug: true` to ensure endpoints respond.
3. For large projects, experiment with `fileBatchSize` (e.g. `50`, `200`) and watch rebuild timings in the console.

## Installation
```bash
# npm
npm install vite-plugin-vue-i18n-typescript@1.2.0

# pnpm
pnpm add vite-plugin-vue-i18n-typescript@1.2.0

# bun
bun add vite-plugin-vue-i18n-typescript@1.2.0
```

## Quick Start
```typescript
// vite.config.ts
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import i18nTypes from 'vite-plugin-vue-i18n-typescript'

export default defineConfig({
    plugins: [
        vue(),
        i18nTypes({
            debug: true,
            fileBatchSize: 200,
        })
    ]
})
```
