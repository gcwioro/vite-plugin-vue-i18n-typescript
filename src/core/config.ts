import type {VirtualKeysDtsOptions} from "../types";
import {deepMerge, defaultGetLocaleFromPath, shallowMerge} from "../utils";

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


  inlineDataInBuild: boolean;
  emit: {
    fileName: string;
  };
  transformJson?: (json: unknown, absPath: string) => unknown;
  virtualId: string;
  resolvedVirtualId: string;
}

/**
 * Normalize and validate plugin configuration
 */
export function normalizeConfig(userOptions: VirtualKeysDtsOptions = {}): NormalizedConfig {
  const baseLocale = userOptions.baseLocale ?? 'de';

  const config: NormalizedConfig = {
    sourceId: userOptions.sourceId ?? 'virtual:unplug-i18n-dts-generation',
    typesPath: userOptions.typesPath ?? './vite-env-override.d.ts',
    virtualFilePath: userOptions.virtualFilePath,
    getLocaleFromPath: userOptions.getLocaleFromPath ?? defaultGetLocaleFromPath,
    baseLocale,
    include: Array.isArray(userOptions.include)
      ? userOptions.include
      : userOptions.include
        ? [userOptions.include]
        : [
          "src/**/locales/*.json",
          "src/**/*.vue.*.json",
          `src/**/*${baseLocale}.json`
        ],
    exclude: Array.isArray(userOptions.exclude)
      ? userOptions.exclude
      : userOptions.exclude
        ? [userOptions.exclude]
        : [
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
    inlineDataInBuild: userOptions.emit?.inlineDataInBuild ?? false,
    emit: {
      fileName: "assets/locales.json",
    },
    transformJson: userOptions.transformJson,
    virtualId: userOptions.sourceId ?? 'virtual:unplug-i18n-dts-generation',
    resolvedVirtualId: "\0" + (userOptions.sourceId ?? 'virtual:unplug-i18n-dts-generation'),
  };

  return config;
}
