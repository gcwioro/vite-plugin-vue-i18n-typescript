import type { JSONValue, JSONObject, JSONArray } from '../types'

/**
 * Create an O(1) set for keys to strip during structural JSON extraction.
 */

// ---------- Config ----------
const keysToRemoveSet = new Set<string>(['type', 'start', 'end', 'loc', 'source'])


// ---------- Helpers ----------
function isPlainObject(value: unknown): value is JSONObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function unwrapBody(node: JSONObject): JSONValue | undefined {
  // We only unwrap if this *node itself* has a "body" object
  const maybeBody = node['body']
  if (!isPlainObject(maybeBody)) return undefined

  // Prefer `{ static: ... }` if present
  if ('static' in maybeBody) {
    return (maybeBody as JSONObject)['static'] as JSONValue
  }

  // Fall back to `{ items: ... }`
  if ('items' in maybeBody) {
    return (maybeBody as JSONObject)['items'] as JSONValue
  }

  return undefined
}


// ---------- Core ----------
/**
 * Structure-normalizing extractor. Removes AST-ish metadata, unwraps translation bodies,
 * and preserves shape while pruning noise. It's defensive and avoids repeated lookups.
 */
export function extractJson<T extends JSONValue>(obj: T): T {
  // Primitives are returned as-is
  if (obj === null || typeof obj !== 'object') return obj

  // Arrays: normalize each element
  if (Array.isArray(obj)) {
    const arr = obj as JSONArray
    const out: JSONArray = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      out[i] = extractJson(arr[i])
    }
    return out as T
  }

  // Objects
  const input = obj as JSONObject

  // If this object is an AST node with a "body", unwrap it *before* key-iteration.
  const unwrapped = unwrapBody(input)
  if (unwrapped !== undefined) {
    return extractJson(unwrapped as JSONValue) as T
  }

  // If this looks like a locale map (e.g., { de: {...}, en: {...} }), collapse to a preferred locale.
  // if (isLikelyLocaleMap(input)) {
  //   const chosen = pickLocaleKey(input)
  //   return extractJson(input[chosen] as JSONValue) as T
  // }

  // Otherwise, build a cleaned object
  const result: JSONObject = {}
  for (const key of Object.keys(input)) {
    if (keysToRemoveSet.has(key)) continue

    const value = input[key]

    // Recurse; this will handle nested arrays and nested AST nodes
    result[key] = extractJson(value)
  }

  return result as T
}
/**
 * Collect dot-notated leaf paths of an object. Arrays count as leaves.
 * Example: { a: { b: 1 }, c: [1,2] } => ["a.b", "c"]
 */
export function getJsonLeafPaths(obj: JSONValue): string[] {
  const paths: string[] = []

  function walk(value: JSONValue, currentPath: string) {
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        paths.push(currentPath)
        return
      }
      const entries = Object.entries(value as JSONObject)
      if (entries.length === 0 && currentPath === '') {
        // Empty root object - return empty array
        return
      }
      for (const [k, v] of entries) {
        const next = currentPath ? `${currentPath}.${k}` : k
        walk(v, next)
      }
      return
    }
    // primitive leaf
    if (currentPath) {
      paths.push(currentPath)
    }
  }

  walk(obj, '')
  return paths
}

/**
 * Canonicalize JSON by sorting object keys recursively.
 * Arrays are preserved in-place to keep their intended order.
 */
export function canonicalize<T extends JSONValue>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    const arr = value as JSONArray
    const out: JSONArray = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) out[i] = canonicalize(arr[i])
    return out as T
  }
  const obj = value as JSONObject
  const keys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const out: JSONObject = {}
  for (const k of keys) out[k] = canonicalize(obj[k])
  return out as T
}
