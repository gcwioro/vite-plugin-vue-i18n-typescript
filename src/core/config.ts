import type {VirtualKeysDtsOptions} from "../types";
import {deepMerge, defaultGetLocaleFromPath, shallowMerge} from "../utils";
import type {CustomLogger} from "../createConsoleLogger";
import path from "node:path";
import {normalizePath, type ResolvedConfig} from "vite";

export const Consts = {
  //devUrlPath
  devUrlPath: "/_virtual_locales.json",
  debugUrlPath: "/__locales_debug__",
} as const;

// export type GenerationOptions =
//   Required<Omit<VirtualKeysDtsOptions, 'exclude' | 'include' | 'emit' | 'root' | 'virtualFilePath'>>
//   & {
export interface GenerationOptions extends Omit<VirtualKeysDtsOptions, 'exclude' | 'extends'> {

  root: string;
  sourceId: string;
  typesPath: string;
  // virtualFilePath?: string;
  getLocaleFromPath: (absPath: string, root: string) => string | null;
  baseLocale: string;

  merge: "deep" | "shallow";

  // banner?: string;
  // debug: boolean;

  virtualFilePath?: string,

  mergeFunction: (a: any, b: any) => any;
  emit: {
    inlineDataInBuild: boolean;
    fileName: string;
    emitJson: boolean;
  };
  include: string[];
  exclude: string[];
  debug: boolean;
  transformJson?: (json: unknown, absPath: string) => unknown;
  verbose: boolean;
  logger: CustomLogger,
}

/**
 * Normalize and validate plugin configuration
 */
export function normalizeConfig(userOptions: VirtualKeysDtsOptions = {}, logger: CustomLogger, cfg?: {
  root?: string
} | ResolvedConfig): GenerationOptions {
  const baseLocale = userOptions.baseLocale ?? 'de';
  const root: string = cfg?.root ?? userOptions.root ?? process.cwd();

  function resolvePattern(pattern: string): string {
    if (!pattern) throw new Error('Invalid pattern: empty string');
    const isNegated = pattern.startsWith("!");
    const rawPattern = isNegated ? pattern.slice(1) : pattern;
    const trimmedPattern = rawPattern.startsWith("./") ? rawPattern.slice(2) : rawPattern;
    const absolutePattern = path.isAbsolute(rawPattern)
      ? rawPattern
      : path.join(root, trimmedPattern);
    const normalized = normalizePath(absolutePattern);
    return isNegated ? `!${normalized}` : normalized;
  }

  const sourceId = userOptions.sourceId ?? 'virtual:vue-i18n-types';


  const config: GenerationOptions = {
    ...userOptions,
    sourceId,
    root,
    verbose: userOptions.debug ?? false,
    typesPath: userOptions.typesPath ?? './src/vite-env-override.d.ts',
    virtualFilePath: userOptions.virtualFilePath,
    getLocaleFromPath: userOptions.getLocaleFromPath ?? defaultGetLocaleFromPath,
    baseLocale,
    include: (Array.isArray(userOptions.include)
      ? userOptions.include
      : userOptions.include
        ? [userOptions.include]
        : [
          "./**/locales/*.json",
          "./**/*.vue.*.json",
          `./**/*${baseLocale}.json`
        ]).map(resolvePattern),
    exclude: (Array.isArray(userOptions.exclude)
      ? userOptions.exclude
      : userOptions.exclude
        ? [userOptions.exclude]
        : [
          '**/tsconfig.*',
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.output/**',
          '**/.vercel/**',
          '**/.next/**',
          '**/build/**',
        ]).map((pattern) => {
      const resolved = resolvePattern(pattern);

      return resolved.startsWith("!") ? resolved : `!${resolved}`;
    }).map((pattern) => {
      const resolved = resolvePattern(pattern);

      return resolved.startsWith("!") ? resolved : `!${resolved}`;
    }),
    merge: userOptions.merge ?? 'deep',
    mergeFunction: (userOptions.merge ?? 'deep') === 'deep' ? deepMerge : shallowMerge,
    banner: userOptions.banner,
    debug: userOptions.debug ?? false,
    emit: {
      fileName: "assets/locales.json",
      inlineDataInBuild: userOptions.emit?.inlineDataInBuild ?? false,

      emitJson: userOptions.emit?.emitJson ?? true,
    },
    logger,
  };

  // Validate config
  if (!config.emit.emitJson && !config.emit.inlineDataInBuild) {
    logger.error(`'emit.emitJson' and 'emit.inlineDataInBuild' are both 'false'.`);
  }


  return config;
}


