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
    emitJson: boolean;
  };
  transformJson?: (json: unknown, absPath: string) => unknown;
  virtualId: string;
  resolvedVirtualId: string;
  virtualJsonId: string;
  resolvedVirtualJsonId: string;
}

/**
 * Normalize and validate plugin configuration
 */
export function normalizeConfig(userOptions: VirtualKeysDtsOptions = {}): NormalizedConfig {
  const baseLocale = userOptions.baseLocale ?? 'de';

  const sourceId = userOptions.sourceId ?? 'virtual:vue-i18n-types';

  const config: NormalizedConfig = {
    sourceId,
    typesPath: userOptions.typesPath ?? './vite-env-override.d.ts',
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
      emitJson: userOptions.emit?.emitJson ?? false,
    },
    transformJson: userOptions.transformJson,
    virtualId: sourceId,
    resolvedVirtualId: "\0" + sourceId,
    virtualJsonId: sourceId + '/messages',
    resolvedVirtualJsonId: "\0" + sourceId + '/messages',
  };

  return config;
}
