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

/**
 * Debounce with max wait time
 */
export function debounceWithMaxWait(fn: ((server: ViteDevServer, rootDir: string) => Promise<void>), ms: number, maxWait: number) {
  let t: ReturnType<typeof setTimeout> | undefined
  let lastInvoke = 0
  return (...args: Parameters<((server: ViteDevServer, rootDir: string) => Promise<void>)>) => {
    const now = Date.now()
    if (!lastInvoke) lastInvoke = now
    if (t) clearTimeout(t)
    if (now - lastInvoke >= maxWait) {
      fn(...args)
      lastInvoke = 0
    } else {
      t = setTimeout(() => {
        fn(...args)
        lastInvoke = 0
      }, ms)
    }
  }
}
