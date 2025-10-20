# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/your-repo/vite-plugin-vue-i18n-typescript/compare/v1.0.2...HEAD

[1.0.2]: https://github.com/your-repo/vite-plugin-vue-i18n-typescript/compare/v1.0.1...v1.0.2

[1.0.1]: https://github.com/your-repo/vite-plugin-vue-i18n-typescript/compare/v1.0.0...v1.0.1

[1.0.0]: https://github.com/your-repo/vite-plugin-vue-i18n-typescript/releases/tag/v1.0.0
