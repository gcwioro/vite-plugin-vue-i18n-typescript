import type { ViteDevServer } from 'vite'
import type { JSONValue } from './types'

/**
 * Load the virtual module via Vite's SSR pipeline so that other plugins (that provide it)
 * can resolve & load it. This returns the actual runtime value of the specified export.
 */
export async function loadExportFromVirtual(
  server: ViteDevServer,
  sourceId: string,
  exportName: string = 'default',
): Promise<Record<string, JSONValue>> {
  const mod = await server.ssrLoadModule(sourceId)
  if (!mod) {
    throw new Error(`Could not ssrLoadModule("${sourceId}")`)
  }
  const out =
    exportName === 'default'
      ? (mod ).default
      : (mod )[exportName]

  if (out == null) {
    throw new Error(
      `[unplugin-vue-i18n-dts-generation] Export "${exportName}" not found or is null in "${sourceId}".`,
    )
  }
  if (typeof out !== 'object') {
    throw new Error(
      `[unplugin-vue-i18n-dts-generation] Export "${exportName}" in "${sourceId}" must be an object (received ${typeof out}).`,
    )
  }
  return out
}
