import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './misc'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should delay function execution', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('test')
    expect(fn).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(fn).toHaveBeenCalledWith('test')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset delay on subsequent calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    debouncedFn('second')

    vi.runAllTimers()
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call function only once for rapid calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    for (let i = 0; i < 10; i++) {
      debouncedFn(i)
    }

    expect(fn).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(fn).toHaveBeenCalledWith(9)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple arguments', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2', 'arg3')
    vi.runAllTimers()

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('should handle no arguments', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    vi.runAllTimers()

    expect(fn).toHaveBeenCalledWith()
  })

  it('should allow separate executions after delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    vi.runAllTimers()
    expect(fn).toHaveBeenCalledWith('first')
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn('second')
    vi.runAllTimers()
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
