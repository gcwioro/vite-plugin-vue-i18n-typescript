import type {JSONArray, JSONObject, JSONValue} from '../types'
import {transformKeys} from "./keys";


type MessageNode = {
  type: number
  loc?: { source?: string }
  static?: string
  body?: any
  cases?: any[]
  items?: any[]
};

function extractMessage(node: MessageNode): string {
  // if the compiler preserved the original source string
  if (node?.loc?.source) {
    return node.loc.source;
  }

  // fallback to static text
  if (node.static) {
    return node.static;
  }

  // if it’s a plural/choice
  if (node.cases) {
    return node.cases.map(c => extractMessage(c)).join(" | ");
  }

  // if it’s a compound message
  if (node.items) {
    return node.items.map(extractMessage).join("");
  }

  return "";
}

/**
 * Structure-normalizing extractor. Removes AST-ish metadata, unwraps translation bodies,
 * and preserves shape while pruning noise. It's defensive and avoids repeated lookups.
 */
export function extractJson<T extends Record<string, any>|MessageNode>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(extractJson);
  }

  if (obj && typeof obj === "object" && "type" in obj) {
    return extractMessage(obj as MessageNode);
  }

  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = extractJson(v);
    }
    return result;
  }

  return obj;
}

/**
 * Collect dot-notated leaf paths of an object.
 * - Primitives produce their full path.
 * - Arrays count as leaves (the array path is included) AND their items are traversed,
 *   producing index paths (e.g., "c", "c.0", "c.1").
 * Example:
 *   { a: { b: 1 }, c: ['test', 'asdf'] } => ["a.b", "c", "c.0", "c.1"]
 */
export function getJsonLeafPaths(obj: Record<string, unknown>): string[] {
  const paths: string[] = [];

  const isPlainObject = (val: unknown): val is Record<string, unknown> =>
    Object.prototype.toString.call(val) === "[object Object]";

  function walk(value: unknown, currentPath: string): void {
    // Treat null/undefined as leaf values
    if (value == null) {
      if (currentPath) paths.push(currentPath);
      return;
    }

    // Arrays: include the array path itself and traverse items
    if (Array.isArray(value)) {
      if (currentPath) paths.push(currentPath);
      for (let i = 0; i < value.length; i++) {
        const next = currentPath ? `${currentPath}.${i}` : String(i);
        walk(value[i], next);
      }
      return;
    }

    // Plain objects: traverse properties
    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        if (currentPath) paths.push(currentPath);
        return;
      }
      for (const [k, v] of entries) {
        const next = currentPath ? `${currentPath}.${k}` : k;
        walk(v, next);
      }
      return;
    }

    // Primitive or non-plain object (Date, Map, etc.) – treat as leaf
    if (currentPath) {
      paths.push(currentPath);
    }
  }

  walk(obj, "");
  return paths;
}

/**
 * Canonicalize JSON by sorting object keys recursively.
 * Arrays are preserved in-place to keep their intended order.
 */
export function canonicalize<T extends JSONValue>(value: T | undefined): T {
  if (value === null || typeof value !== 'object') return value as T
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

/**
 * Detect conflicting keys across different locales.
 * A conflict occurs when the same key path has different types (e.g., string vs object) across locales.
 * @param messages - Object with locale codes as keys and message objects as values
 * @returns Array of conflict descriptions
 */
export function detectKeyConflicts(messages: Record<string, JSONValue>): string[] {
  const conflicts: string[] = []
  const keyTypeMap = new Map<string, Map<string, string>>() // key -> locale -> type

  // Helper to get the type of a value
  const getValueType = (val: unknown): string => {
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'
    if (Array.isArray(val)) return 'array'
    if (typeof val === 'object') return 'object'
    return typeof val
  }

  // Helper to traverse and collect all key paths with their types
  const collectKeyTypes = (obj: unknown, locale: string, path = ''): void => {
    if (obj === null || obj === undefined) {
      if (path) {
        if (!keyTypeMap.has(path)) keyTypeMap.set(path, new Map())
        keyTypeMap.get(path)!.set(locale, getValueType(obj))
      }
      return
    }

    if (Array.isArray(obj)) {
      if (path) {
        if (!keyTypeMap.has(path)) keyTypeMap.set(path, new Map())
        keyTypeMap.get(path)!.set(locale, 'array')
      }
      // Don't traverse array items for conflict detection
      return
    }

    if (typeof obj === 'object') {
      if (path) {
        if (!keyTypeMap.has(path)) keyTypeMap.set(path, new Map())
        keyTypeMap.get(path)!.set(locale, 'object')
      }
      for (const [key, value] of Object.entries(obj)) {
        const newPath = path ? `${path}.${key}` : key
        collectKeyTypes(value, locale, newPath)
      }
      return
    }

    // Primitive value
    if (path) {
      if (!keyTypeMap.has(path)) keyTypeMap.set(path, new Map())
      keyTypeMap.get(path)!.set(locale, getValueType(obj))
    }
  }

  // Collect all key types for each locale
  for (const [locale, localeMessages] of Object.entries(messages)) {
    if (locale === 'js-reserved') continue
    collectKeyTypes(localeMessages, locale)
  }

  // Check for conflicts
  for (const [key, localeTypes] of keyTypeMap.entries()) {
    const types = Array.from(localeTypes.entries())
    const uniqueTypes = new Set(types.map(([_, type]) => type))

    if (uniqueTypes.size > 1) {
      // We have a conflict
      const typeGroups = new Map<string, string[]>()
      for (const [locale, type] of types) {
        if (!typeGroups.has(type)) typeGroups.set(type, [])
        typeGroups.get(type)!.push(locale)
      }

      const groupDescriptions = Array.from(typeGroups.entries())
        .map(([type, locales]) => `${type} in [${locales.join(', ')}]`)
        .join(' vs ')

      conflicts.push(`Key "${key}" has conflicting types: ${groupDescriptions}`)
    }
  }

  return conflicts
}

export function getFinalKeys<TKey extends string | number | symbol>(messages: Record<TKey, JSONValue>, baseLocale: TKey): string[] {
  const messagesForBaseLocale = (messages?.[baseLocale] ?? Object.values(messages)[0]) as Record<string, JSONValue>;
  const allKeysRaw = getJsonLeafPaths(messagesForBaseLocale)
    .map((p) => p.replace(/\.body\.cases$/g, ''))

  return transformKeys(allKeysRaw);
}
