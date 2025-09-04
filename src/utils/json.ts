import type {JSONValue, JSONObject, JSONArray} from '../types'


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
        // Empty object – no leaves to add (even if nested)
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
