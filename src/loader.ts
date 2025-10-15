import type { ViteDevServer } from 'vite'
import type { JSONValue } from './types'

/**
 * Load the virtual module via Vite's transform pipeline and evaluate it
 * to get the actual runtime value of the specified export.
 *
 * Follows Vite 7 best practices for virtual module loading without SSR
 */

export async function loadExportFromVirtual(
  server: ViteDevServer,
  sourceId: string,
  exportName: string = 'default',
): Promise<Record<string, JSONValue>> {

  // Transform the virtual module to get its code
  const result = await server.transformRequest(sourceId)
  console.log('locales', result)
  if (!result || !result.code) {
    throw new Error(`Could not transform module "${sourceId}"`)
  }

  try {
    // Parse ES module exports using regex patterns
    const code = result.code

    // Try multiple patterns to find the export
    let exportedValue: any = null

    // Pattern 1: export default with direct object literal
    const defaultObjectMatch = code.match(/export\s+default\s+(\{[\s\S]*?\})\s*(?:;|$)/m)

    // Pattern 2: export default with variable reference
    const defaultVarMatch = code.match(/export\s+default\s+(\w+)\s*(?:;|$)/m)

    // Pattern 3: const/let/var declaration then export
    const varDeclMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\{[\s\S]*?\})\s*(?:;|$)/m)

    if (exportName === 'default') {
      if (defaultObjectMatch) {
        // Direct object export
        const fn = new Function(`return ${defaultObjectMatch[1]}`)
        exportedValue = fn()
      } else if (defaultVarMatch) {
        // Variable reference - need to find the variable
        const varName = defaultVarMatch[1]
        const varPattern = new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*([\\s\\S]*?)(?:;|\\n\\n|$)`, 'm')
        const varMatch = code.match(varPattern)
        if (varMatch) {
          const fn = new Function(`return ${varMatch[1]}`)
          exportedValue = fn()
        }
      }
    }

    // If still no match, try to find any object-like export
    if (!exportedValue && varDeclMatch) {
      const fn = new Function(`return ${varDeclMatch[2]}`)
      exportedValue = fn()
    }

    // Final fallback: try to evaluate as CommonJS
    if (!exportedValue) {
      // Create a simple CommonJS context
      const moduleExports: any = {}
      const moduleObj = {exports: moduleExports}

      // Transform ES module to CommonJS format
      const cjsCode = code
        .replace(/export\s+default\s+/, 'module.exports = ')
        .replace(/export\s+\{/, 'module.exports = {')

      // Try to evaluate the CommonJS code safely
      const fnBody = `
        var module = arguments[0];
        var exports = module.exports;
        ${cjsCode}
        return module.exports;
      `

      try {
        const fn = new Function(fnBody)
        const result = fn(moduleObj)
        exportedValue = exportName === 'default'
          ? (result.default || result)
          : result[exportName]
      } catch {
        // If evaluation fails, try to extract JSON directly
        const jsonMatch = code.match(/(?:export\s+default|module\.exports\s*=)\s*({[\s\S]*?})\s*(?:;|$)/m)
        if (jsonMatch) {
          try {
            // Try to parse as JSON first
            exportedValue = JSON.parse(jsonMatch[1])
          } catch {
            // If not valid JSON, evaluate as JavaScript object literal
            const fn = new Function(`return ${jsonMatch[1]}`)
            exportedValue = fn()
          }
        }
      }
    }

    if (exportedValue == null) {
      throw new Error(
        `Export "${exportName}" not found or is null in "${sourceId}"`,
      )
    }
    if (typeof exportedValue !== 'object') {
      throw new Error(
        `Export "${exportName}" in "${sourceId}" must be an object, received ${typeof exportedValue}`,
      )
    }
    return exportedValue
  } catch (error) {
    throw new Error(
      `Failed to evaluate module "${sourceId}": ${(error as Error).message}`
    )
  }
}
