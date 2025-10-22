import type {VirtualKeysDtsOptions} from "../types";
import {deepMerge, defaultGetLocaleFromPath, shallowMerge} from "../utils";
import type {CustomLogger} from "../createConsoleLogger";

export interface NormalizedConfig {
  sourceId: string;
  typesPath: string;
  virtualFilePath?: string;
  getLocaleFromPath: (absPath: string, root: string) => string | null;
  baseLocale: string;
  include: string[];
  exclude: string[];
  merge: "deep" | "shallow";
  mergeFunction: (a: any, b: any) => any;
  banner?: string;
  debug: boolean;
  devUrlPath: string;
  emit: {
    inlineDataInBuild: boolean;
    fileName: string;
    emitJson: boolean;
  };
  transformJson?: (json: unknown, absPath: string) => unknown;

  logger: CustomLogger,
}

/**
 * Normalize and validate plugin configuration
 */
export function normalizeConfig(userOptions: VirtualKeysDtsOptions = {}, logger: CustomLogger): NormalizedConfig {
  const baseLocale = userOptions.baseLocale ?? 'de';

  const sourceId = userOptions.sourceId ?? 'virtual:vue-i18n-types';

  const config: NormalizedConfig = {
    sourceId,

    typesPath: userOptions.typesPath ?? './src/vite-env-override.d.ts',
    virtualFilePath: userOptions.virtualFilePath,
    getLocaleFromPath: userOptions.getLocaleFromPath ?? defaultGetLocaleFromPath,
    baseLocale,
    include: Array.isArray(userOptions.include)
      ? userOptions.include
      : userOptions.include
        ? [userOptions.include]
        : [
          "./**/locales/*.json",
          "./**/*.vue.*.json",
          `./**/*${baseLocale}.json`
        ],
    exclude: Array.isArray(userOptions.exclude)
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
        ],
    merge: userOptions.merge ?? 'deep',
    mergeFunction: (userOptions.merge ?? 'deep') === 'deep' ? deepMerge : shallowMerge,
    banner: userOptions.banner,
    debug: userOptions.debug ?? false,
    devUrlPath: userOptions.devUrlPath ?? "/_virtual_locales.json",
    emit: {
      fileName: "assets/locales.json",
      inlineDataInBuild: userOptions.emit?.inlineDataInBuild ?? false,

      emitJson: userOptions.emit?.emitJson ?? true,
    },
    transformJson: userOptions.transformJson,
    logger,
  };

  // Validate config
  if (!config.emit.emitJson && !config.emit.inlineDataInBuild) {
    logger.error(`'emit.emitJson' and 'emit.inlineDataInBuild' are both 'false'.`);
  }


  return config;
}
