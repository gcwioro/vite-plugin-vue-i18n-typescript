# CLI Usage

The CLI tool allows you to generate TypeScript types without running Vite, perfect for CI/CD pipelines and pre-commit
hooks.

## Installation

The CLI comes bundled with the package:

```bash
npm install -D unplugin-vue-i18n-dts-generation
```

## Basic Usage

```bash
# Generate types once
npx unplugin-vue-i18n-dts-generation generate

# Watch mode - regenerate on file changes
npx unplugin-vue-i18n-dts-generation generate --watch

# With custom options
npx unplugin-vue-i18n-dts-generation generate \
  --base-locale en \
  --types-path src/types/i18n.d.ts \
  --verbose
```

## Command Reference

### Generate Command

```
npx unplugin-vue-i18n-dts-generation generate [options]
```

#### Options

| Option                       | Description                                      | Default                              |
|------------------------------|--------------------------------------------------|--------------------------------------|
| `--root <path>`              | Project root directory                           | Current directory                    |
| `--include <pattern>`        | Glob pattern for locale files (multiple allowed) | `src/locales/**/*.json`              |
| `--exclude <pattern>`        | Glob pattern to exclude (multiple allowed)       | Node modules, dist, etc.             |
| `--base-locale <locale>`     | Base locale for type generation                  | `de`                                 |
| `--types-path <path>`        | Output path for TypeScript definitions           | `./vite-env-override.d.ts`           |
| `--virtual-file-path <path>` | Generate virtual module as file (debugging)      | -                                    |
| `--source-id <id>`           | Virtual module ID                                | `virtual:unplug-i18n-dts-generation` |
| `--banner <text>`            | Custom header comment for generated files        | -                                    |
| `--merge <type>`             | Merge strategy: `deep` or `shallow`              | `deep`                               |
| `--watch, -w`                | Watch mode - regenerate on changes               | `false`                              |
| `--debug`                    | Enable debug logging                             | `false`                              |
| `--verbose, -v`              | Enable verbose output                            | `false`                              |
| `--help, -h`                 | Show help message                                | -                                    |
| `--version`                  | Show version                                     | -                                    |

## Examples

### Multiple Include Patterns

```bash
npx unplugin-vue-i18n-dts-generation generate \
  --include "src/locales/**/*.json" \
  --include "src/modules/**/i18n/*.json" \
  --base-locale en
```

### Custom Root Directory

```bash
npx unplugin-vue-i18n-dts-generation generate \
  --root ./packages/frontend \
  --base-locale en \
  --verbose
```

### Generate Debug File

```bash
npx unplugin-vue-i18n-dts-generation generate \
  --virtual-file-path src/i18n/debug.gen.ts \
  --verbose
```

### Watch Mode

```bash
npx unplugin-vue-i18n-dts-generation generate --watch --verbose
```

When watch mode is enabled:

- Monitors all locale files for changes
- Automatically regenerates types when files are added, modified, or removed
- Uses debouncing (500ms) to avoid excessive regenerations
- Shows detailed logs with `--verbose` flag

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "i18n:generate": "unplugin-vue-i18n-dts-generation generate",
    "i18n:watch": "unplugin-vue-i18n-dts-generation generate --watch",
    "i18n:debug": "unplugin-vue-i18n-dts-generation generate --verbose --debug",
    "precommit": "unplugin-vue-i18n-dts-generation generate"
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm ci

      - name: Generate i18n types
        run: npx unplugin-vue-i18n-dts-generation generate --verbose

      - name: Type check
        run: npm run typecheck
```

### GitLab CI

```yaml
typecheck:
  stage: test
  script:
    - npm ci
    - npx unplugin-vue-i18n-dts-generation generate --verbose
    - npm run typecheck
```

### Pre-commit Hook

Using `husky`:

```bash
# Install husky
npm install -D husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npx unplugin-vue-i18n-dts-generation generate && git add ."
```

## Export Command

Export merged translation messages to JSON files:

```bash
# Export all messages to a single file
npx unplugin-vue-i18n-dts-generation merge-export --output ./export/messages.json

# Export separate files per locale
npx unplugin-vue-i18n-dts-generation merge-export --split --output ./export/{locale}.json
```

### Export Options

| Option            | Description                             | Default |
|-------------------|-----------------------------------------|---------|
| `--output <path>` | Output path for JSON file(s) (required) | -       |
| `--split`         | Export separate files per locale        | `false` |
| Other options     | Same as generate command                | -       |

## Tips

1. **Use watch mode during development** if you're not using the Vite plugin
2. **Add to pre-commit hooks** to ensure types are always up-to-date
3. **Use verbose mode in CI/CD** to debug any issues
4. **Generate debug file** when troubleshooting type generation
