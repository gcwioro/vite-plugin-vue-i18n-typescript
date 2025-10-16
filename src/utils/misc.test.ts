import {describe, it, expect, vi} from 'vitest'
import { debounce } from './misc'

describe('debounce', () => {
  it('should delay function execution', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('test')

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(fn).toHaveBeenCalledWith('test')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset delay on subsequent calls', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    await new Promise(resolve => setTimeout(resolve, 50))
    debouncedFn('second')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call function only once for rapid calls', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    for (let i = 0; i < 10; i++) {
      debouncedFn(i)
    }

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith(9)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple arguments', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2', 'arg3')
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('should handle no arguments', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(fn).toHaveBeenCalledWith()
  })

  it('should allow separate executions after delay', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith('first')
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn('second')
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
