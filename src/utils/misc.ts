import type {ViteDevServer} from "vite";

/**
 * Simple debounce helper for FS-driven regeneration bursts.
 */
export function debounce(fn: ((server: ViteDevServer, rootDir: string) => Promise<void>), ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<((server: ViteDevServer, rootDir: string) => Promise<void>)>) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
