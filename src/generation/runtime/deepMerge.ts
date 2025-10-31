function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
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

export {deepMerge, deepMerge as default};
