import type { JSONValue, JSONObject, JSONArray } from '../types'

/**
 * Create an O(1) set for keys to strip during structural JSON extraction.
 */
const keysToRemoveSet = new Set(['loc', 'type', 'start', 'end'])

/**
 * Structure-normalizing extractor. Removes AST-ish metadata, unwraps translation bodies,
 * and preserves shape while pruning noise. It's defensive and avoids repeated lookups.
 */
export function extractJson<T extends JSONValue>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    const arr = obj as JSONArray
    const out: JSONArray = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      out[i] = extractJson(arr[i])
    }
    return out as T
  }

  const input = obj as JSONObject
  const result: JSONObject = {}

  for (const key of Object.keys(input)) {
    if (keysToRemoveSet.has(key)) continue

    const value = input[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const body = (value as JSONObject)['body'] as JSONValue | undefined

      // Body with { static: ... }
      const hasStatic = !!(body && typeof body === 'object' && !Array.isArray(body) && 'static' in (body as JSONObject))
      if (hasStatic) {
        result[key] = (body as JSONObject)['static'] ?? null
        continue
      }

      // Body with { items: ... }
      const items = body && typeof body === 'object' && !Array.isArray(body) ? (body as JSONObject)['items'] : undefined
      if (items !== undefined) {
        result[key] = extractJson(items as JSONValue)
        continue
      }
    }

    // Default recursive descent
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