/**
 * Default key normalization: unique + ascending lexicographic sort.
 */
export function transformKeys(keys: string[]): string[] {
  const set = new Set<string>()
  for (const k of keys) {
    if (typeof k === 'string' && k) set.add(k)
  }
  return Array.from(set).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}
