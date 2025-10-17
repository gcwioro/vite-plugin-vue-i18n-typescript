#!/usr/bin/env node

import path from "node:path";
import {parseArgs} from "node:util";
import {watch} from "chokidar";
import {generateI18nTypes} from "./api";
import type {GenerateTypesOptions} from "./api";

const helpText = `
unplugin-vue-i18n-dts-generation CLI

Generate TypeScript definitions from Vue i18n locale files

Usage:
  npx unplugin-vue-i18n-dts-generation generate [options]

Options:
  --root <path>              Root directory (default: current directory)
  --include <pattern>        Glob pattern(s) for locale files (can be specified multiple times)
  --exclude <pattern>        Glob pattern(s) to exclude (can be specified multiple times)
  --base-locale <locale>     Base locale for type generation (default: "de")
  --types-path <path>        Output path for .d.ts file (default: "./vite-env-override.d.ts")
  --virtual-file-path <path> Output path for virtual module .ts file (optional)
  --source-id <id>           Virtual module ID (default: "virtual:unplug-i18n-dts-generation")
  --banner <text>            Custom banner comment for generated files
  --merge <type>             Merge strategy: "deep" or "shallow" (default: "deep")
  --watch, -w                Watch mode - regenerate on file changes
  --debug                    Enable debug logging
  --verbose, -v              Enable verbose output
  --help, -h                 Show this help message
  --version                  Show version

Examples:
  # Basic usage with default settings
  npx unplugin-vue-i18n-dts-generation generate

  # Specify custom paths and base locale
  npx unplugin-vue-i18n-dts-generation generate --base-locale en --types-path src/types/i18n.d.ts

  # Multiple include patterns
  npx unplugin-vue-i18n-dts-generation generate --include "src/locales/**/*.json" --include "src/i18n/**/*.json"

  # Generate virtual file for debugging
  npx unplugin-vue-i18n-dts-generation generate --virtual-file-path src/i18n/virtual.gen.ts --verbose

  # Custom root directory
  npx unplugin-vue-i18n-dts-generation generate --root ./packages/frontend --base-locale en

  # Watch mode - regenerate on file changes
  npx unplugin-vue-i18n-dts-generation generate --watch --verbose
`;

async function main() {
  try {
    const args = process.argv.slice(2);

    // Handle help and version
    if (args.includes("--help") || args.includes("-h") || args.length === 0) {
      console.log(helpText);
      process.exit(0);
    }

    if (args.includes("--version")) {
      // Read version from package.json
      try {
        const {version} = await import("../package.json");
        console.log(`v${version}`);
      } catch {
        console.log("Version unavailable");
      }
      process.exit(0);
    }

    // Check if first arg is "generate" command
    let startIndex = 0;
    if (args[0] === "generate") {
      startIndex = 1;
    }

    // Parse arguments
    const {values} = parseArgs({
      args: args.slice(startIndex),
      options: {
        root: {type: "string"},
        include: {type: "string", multiple: true},
        exclude: {type: "string", multiple: true},
        "base-locale": {type: "string"},
        "types-path": {type: "string"},
        "virtual-file-path": {type: "string"},
        "source-id": {type: "string"},
        banner: {type: "string"},
        merge: {type: "string"},
        watch: {type: "boolean", short: "w"},
        debug: {type: "boolean"},
        verbose: {type: "boolean", short: "v"},
      },
      strict: true,
      allowPositionals: false,
    });

    // Build options
    const options: GenerateTypesOptions = {
      root: values.root,
      verbose: values.verbose ?? values.debug,
      debug: values.debug,
    };

    if (values.include) {
      options.include = values.include;
    }

    if (values.exclude) {
      options.exclude = values.exclude;
    }

    if (values["base-locale"]) {
      options.baseLocale = values["base-locale"];
    }

    if (values["types-path"]) {
      options.typesPath = values["types-path"];
    }

    if (values["virtual-file-path"]) {
      options.virtualFilePath = values["virtual-file-path"];
    }

    if (values["source-id"]) {
      options.sourceId = values["source-id"];
    }

    if (values.banner) {
      options.banner = values.banner;
    }

    if (values.merge) {
      if (values.merge !== "deep" && values.merge !== "shallow") {
        console.error(`❌ Error: --merge must be either "deep" or "shallow"`);
        process.exit(1);
      }
      options.merge = values.merge;
    }

    // Run generation
    let lastResult: Awaited<ReturnType<typeof generateI18nTypes>> | null = null;

    const runGeneration = async (): Promise<void> => {
      const startTime = Date.now();
      console.log("🚀 Generating i18n types...\n");

      try {
        const result = await generateI18nTypes(options);
        lastResult = result;

        const duration = Date.now() - startTime;
        console.log(`\n✅ Generation complete in ${duration}ms!`);
        console.log(`📁 Generated files (${result.filesWritten}):`);
        for (const file of result.generatedFiles) {
          console.log(`   - ${file}`);
        }
        console.log(`🌍 Locales (${result.locales.length}): ${result.locales.join(", ")}`);
        console.log(`📄 Processed ${result.localeFilesCount} locale file(s)`);
      } catch (error) {
        console.error("\n❌ Generation failed:");
        if (error instanceof Error) {
          console.error(error.message);
          if (options.debug || options.verbose) {
            console.error("\nStack trace:");
            console.error(error.stack);
          }
        } else {
          console.error(String(error));
        }
        if (!values.watch) {
          process.exit(1);
        }
      }
    };

    // Initial generation
    await runGeneration();

    // Watch mode
    if (values.watch) {
      console.log("\n👁️  Watch mode enabled - watching for changes...");
      console.log("Press Ctrl+C to exit\n");

      if (!lastResult) {
        console.error("❌ Cannot start watch mode: Initial generation failed");
        process.exit(1);
      }

      const rootDir = path.resolve(options.root || process.cwd());
      const includePatterns = options.include || ['src/**/locales/*.json'];

      if (options.verbose || options.debug) {
        console.log(`[watch] Root directory: ${rootDir}`);
        console.log(`[watch] Patterns: ${Array.isArray(includePatterns) ? includePatterns.join(', ') : includePatterns}`);
      }

      // Use the locale files from the initial generation
      const localeFilesFullPaths = lastResult?.localeFiles || [];

      if (options.verbose || options.debug) {
        console.log(`[watch] Found ${localeFilesFullPaths.length} locale file(s) to watch`);
      }

      // Watch the actual files that were found
      const watcher = watch(localeFilesFullPaths.length > 0 ? localeFilesFullPaths : includePatterns, {
        cwd: rootDir,
        ignored: options.exclude || ['**/node_modules/**', '**/.git/**'],
        persistent: true,
        ignoreInitial: true, // Skip initial add events since we've already generated
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100,
        },
      });

      // Debounce to avoid multiple rapid regenerations
      let debounceTimer: NodeJS.Timeout | null = null;
      const debounceDelay = 500; // 500ms debounce
      let isWatcherReady = false;

      const scheduleRegeneration = (eventType: string, filePath: string) => {
        // Skip initial 'add' events since we've already generated once
        if (!isWatcherReady && eventType === 'added') {
          return;
        }

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          console.log(`\n📝 File ${eventType}: ${filePath}`);
          await runGeneration();
        }, debounceDelay);
      };

      watcher
        .on('ready', () => {
          isWatcherReady = true;
          const watched = watcher.getWatched();
          const watchedCount = Object.values(watched).reduce((sum, files) => sum + files.length, 0);

          if (options.verbose || options.debug) {
            console.log(`[watch] Watcher ready. Watching ${watchedCount} file(s):`);
            for (const [dir, files] of Object.entries(watched)) {
              if (files.length > 0) {
                console.log(`  ${dir}:`);
                for (const file of files) {
                  console.log(`    - ${file}`);
                }
              }
            }
          }

          if (watchedCount === 0) {
            console.warn(`\n⚠️  Warning: No files are being watched!`);
            console.warn(`   Root: ${rootDir}`);
            console.warn(`   Patterns: ${Array.isArray(includePatterns) ? includePatterns.join(', ') : includePatterns}`);
            console.warn(`   This may indicate that the patterns don't match any files.`);
          }
        })
        .on('add', (path) => scheduleRegeneration('added', path))
        .on('change', (path) => scheduleRegeneration('changed', path))
        .on('unlink', (path) => scheduleRegeneration('removed', path))
        .on('error', (error) => {
          console.error('\n❌ Watcher error:', error);
        });

      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n\n👋 Stopping watch mode...');
        watcher.close();
        process.exit(0);
      });

      // Prevent exit
      return;
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error generating types:");
    if (error instanceof Error) {
      console.error(error.message);
      if (process.argv.includes("--debug") || process.argv.includes("--verbose")) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(String(error));
    }
    process.exit(1);
  }
}

main();
