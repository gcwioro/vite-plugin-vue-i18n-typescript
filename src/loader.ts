import type { ViteDevServer } from 'vite'
import type { JSONValue } from './types'

/**
 * Load the virtual module via Vite's SSR pipeline so that other plugins (that provide it)
 * can resolve & load it. This returns the actual runtime value of the specified export.
 * 
 * Follows Vite 7 best practices for virtual module loading
 */
export async function loadExportFromVirtual(
  server: ViteDevServer,
  sourceId: string,
  exportName: string = 'default',
): Promise<Record<string, JSONValue>> {
  const mod = await server.ssrLoadModule(sourceId)
  if (!mod) {
    throw new Error(`Could not load module "${sourceId}" via SSR`)
  }
  const out =
    exportName === 'default'
      ? (mod ).default
      : (mod )[exportName]

  if (out == null) {
    throw new Error(
      `Export "${exportName}" not found or is null in "${sourceId}"`,
    )
  }
  if (typeof out !== 'object') {
    throw new Error(
      `Export "${exportName}" in "${sourceId}" must be an object, received ${typeof out}`,
    )
  }
  return out
}
