import path from "node:path";

export function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
  if (target === source) return target;
  if (Array.isArray(target) && Array.isArray(source)) return source as T;
  if (
    target &&
    source &&
    typeof target === "object" &&
    typeof source === "object" &&
    !Array.isArray(target) &&
    !Array.isArray(source)
  ) {
    const out: Record<string, any> = {...target};
    for (const key of Object.keys(source)) {
      out[key] = key in target ? deepMerge(target[key], (source as any)[key]) : (source as any)[key];
    }
    return out as T;
  }
  return source;
}

export const shallowMerge = <T extends Record<string, any>>(a: T, b: T) => Object.assign({}, a, b);

export function defaultGetLocaleFromPath(filePath: string): string | null {

  // example path: src/locales/Asdf.vue.en.json -> en
  // example path: src/locales/en.json -> en
  const fileName = path.basename(filePath); // Get the file name from the path
  const parts = fileName.split('.')
  // last part is json
  if (parts.length < 2 || parts[parts.length - 1] !== 'json') {
    return null; // Not a JSON file
  }
  return parts?.[parts.length - 2] ?? null; // Return the locale code (second to last part)


}

export const toArray = <T, >(v?: T | T[]) => (Array.isArray(v) ? v : v ? [v] : []);
