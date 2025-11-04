# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-10-31

### Added

- **`merge-export` CLI command** for exporting combined locales or per-locale JSON snapshots (invoked as
  `i18n-typescript merge-export` when installed locally).
- **Debug middleware endpoints** exposed when `debug: true`, serving live locale data at `/_virtual_locales.json` and
  `/__locales_debug__`.
- **`fileBatchSize` option** to control how many locale files are processed simultaneously for large repositories.
- **Locale conflict detection** that reports duplicate keys during generation for faster troubleshooting.

### Changed

- Locale asset emission options were removed; builds no longer generate `assets/locales.json` automatically.
- The published CLI binary name is `i18n-typescript`, so local scripts should call `i18n-typescript` while ad-hoc
  `npx` usage
  remains `npx vite-plugin-vue-i18n-typescript`.
- Additional debug logging around file discovery and rebuild phases for better observability when `debug` is enabled.

### Fixed

- Corrected CLI usage examples to match the actual executable name so automated scripts resolve reliably.

## [1.1.0] - 2025-01-22

### Added

- **Modular Virtual Modules** for improved tree-shaking support
    - Split into sub-modules: `/messages`, `/availableLocales`, `/fallbackLocales`
    - Import only what you need for smaller bundle sizes
    - New dedicated `treeShakeGenerator.ts` for optimized builds
- **New Runtime Helper Functions**
    - `createI18nInstance()` - Factory for creating standalone i18n instances with type safety
    - `createI18nInstancePlugin()` - Factory for creating Vue plugin instances
    - `useI18nApp()` - App-level composable for accessing i18n outside components
- **Fallback Locale Support**
    - Export `fallbackLocales` object with locale fallback chain mappings
    - Automatic fallback chain configuration in helper functions
- **Enhanced Developer Experience**
    - Better console logging with new `createConsoleLogger` utility
    - Improved TypeScript type definitions throughout
    - Cleaner import statements and better code organization

### Changed

- Reorganized generator code into modular components under `src/generation/`
- Improved HMR hot update handling for better development experience
- Enhanced TypeScript configuration and ESLint settings
- Simplified imports and removed redundant code paths

### Removed

- Removed legacy generator code in favor of modular architecture

### Fixed

- Type definition improvements for better IDE support
- Import path consistency across the codebase
- Build process optimizations for faster compilation

## [1.0.2] - 2024-10-20

### Fixed

- Critical bug in base locale message assignment that could affect translation fallback behavior
- ESLint configuration for test helpers ensuring consistent code quality
- CI/CD artifact upload paths for improved build reliability

### Added

- Comprehensive integration test coverage for development and build modes
- Programmatic API integration tests with full coverage
- Test fixtures and helpers for improved maintainability
- Named export `vitePluginVueI18nTypes` alongside default export
- New export path `vite-plugin-vue-i18n-typescript/plugin` for cleaner imports
- `fast-glob` as production dependency for robust file pattern matching

### Changed

- Verbose logging is now controlled by `debug` flag instead of `verbose` (backward compatible)
- Enhanced file watching for locale patterns in development server
- Improved hot module replacement for faster development iteration

### Developer Experience

- Reduced console noise during normal operation
- Better debugging with `debug: true` option
- More flexible import options for the plugin
- Automatic detection of new locale files in dev mode

## [1.0.1] - 2024-10-18

### Fixed

- Minor bug fixes and improvements

## [1.0.0] - 2024-10-17

### Added

- Initial release of vite-plugin-vue-i18n-typescript
- High-performance standalone Vite plugin for generating TypeScript definitions from Vue I18n JSON files
- Type-safe translation keys with compile-time validation
- Incremental updates for optimal performance
- Multiple usage modes: Vite plugin, CLI, and programmatic API
- Support for flat and nested file structures
- Hot module replacement with debounced rebuilds
- Virtual module system for runtime locale loading
- CLI with watch mode and verbose logging
- Dual build (ESM and CommonJS) for compatibility
- Support for Vite 4+ and Vue I18n v11+

### Features

- FileManager for efficient file discovery and caching
- GenerationCoordinator for TypeScript definition generation
- RebuildManager for orchestration and HMR
- Content-based file comparison to avoid unnecessary writes
- Parallel file operations for performance
- Debounced generation (300ms) with max wait (2000ms)
- In-memory caching of parsed locale data

[1.2.0]: https://github.com/gcwioro/vite-plugin-vue-i18n-typescript/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/gcwioro/vite-plugin-vue-i18n-typescript/compare/v1.0.2...v1.1.0

[1.0.2]: https://github.com/gcwioro/vite-plugin-vue-i18n-typescript/compare/v1.0.1...v1.0.2

[1.0.1]: https://github.com/gcwioro/vite-plugin-vue-i18n-typescript/compare/v1.0.0...v1.0.1

[1.0.0]: https://github.com/gcwioro/vite-plugin-vue-i18n-typescript/releases/tag/v1.0.0
