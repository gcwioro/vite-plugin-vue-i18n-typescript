import { describe, it, expect } from 'vitest'
import { extractJson, getJsonLeafPaths, canonicalize } from './json'

describe('extractJson', () => {
  it('should return primitives as-is', () => {
    expect(extractJson('hello')).toBe('hello')
    expect(extractJson(42)).toBe(42)
    expect(extractJson(true)).toBe(true)
    expect(extractJson(null)).toBe(null)
  })

  it('should preserve arrays', () => {
    const input = [1, 2, 3]
    expect(extractJson(input)).toEqual([1, 2, 3])
  })

  it('should remove AST-like metadata', () => {
    const input = {
      key: 'value',
      loc: { start: 0, end: 10 },
      type: 'Identifier',
      start: 0,
      end: 10,
    }
    expect(extractJson(input)).toEqual({ key: 'value' })
  })

  it('should unwrap body with static property', () => {
    const input = {
      message: {
        body: {
          static: 'Hello World',
        },
      },
    }
    expect(extractJson(input)).toEqual({ message: 'Hello World' })
  })

  it('should unwrap body with items property', () => {
    const input = {
      list: {
        body: {
          items: ['item1', 'item2'],
        },
      },
    }
    expect(extractJson(input)).toEqual({ list: ['item1', 'item2'] })
  })

  it('should handle nested structures', () => {
    const input = {
      root: {
        nested: {
          body: {
            static: 'value',
          },
        },
        array: [1, 2, 3],
        loc: { line: 1 },
      },
    }
    expect(extractJson(input)).toEqual({
      root: {
        nested: 'value',
        array: [1, 2, 3],
      },
    })
  })
})

describe('getJsonLeafPaths', () => {
  it('should handle empty object', () => {
    expect(getJsonLeafPaths({})).toEqual([])
  })

  it('should return paths for flat object', () => {
    const input = { a: 1, b: 'test', c: true }
    const paths = getJsonLeafPaths(input)
    expect(paths).toContain('a')
    expect(paths).toContain('b')
    expect(paths).toContain('c')
  })

  it('should return dot-notated paths for nested objects', () => {
    const input = {
      user: {
        name: 'John',
        address: {
          city: 'New York',
        },
      },
    }
    const paths = getJsonLeafPaths(input)
    expect(paths).toContain('user.name')
    expect(paths).toContain('user.address.city')
  })

  it('should treat arrays as leaf nodes', () => {
    const input = {
      items: [1, 2, 3],
      nested: {
        list: ['a', 'b'],
      },
    }
    const paths = getJsonLeafPaths(input)
    expect(paths).toContain('items')
    expect(paths).toContain('nested.list')
    expect(paths).not.toContain('items.0')
  })

  it('should handle mixed structures', () => {
    const input = {
      a: {
        b: {
          c: 'value',
        },
        d: [1, 2],
      },
      e: null,
    }
    const paths = getJsonLeafPaths(input)
    expect(paths).toContain('a.b.c')
    expect(paths).toContain('a.d')
    expect(paths).toContain('e')
  })
})

describe('canonicalize', () => {
  it('should return primitives unchanged', () => {
    expect(canonicalize('test')).toBe('test')
    expect(canonicalize(42)).toBe(42)
    expect(canonicalize(null)).toBe(null)
  })

  it('should preserve arrays in order', () => {
    const input = [3, 1, 2]
    expect(canonicalize(input)).toEqual([3, 1, 2])
  })

  it('should sort object keys alphabetically', () => {
    const input = { z: 1, a: 2, m: 3 }
    const result = canonicalize(input)
    expect(Object.keys(result)).toEqual(['a', 'm', 'z'])
    expect(result).toEqual({ a: 2, m: 3, z: 1 })
  })

  it('should recursively sort nested object keys', () => {
    const input = {
      z: {
        y: 1,
        a: 2,
      },
      a: {
        z: 3,
        b: 4,
      },
    }
    const result = canonicalize(input)
    expect(Object.keys(result)).toEqual(['a', 'z'])
    expect(Object.keys(result.a as any)).toEqual(['b', 'z'])
    expect(Object.keys(result.z as any)).toEqual(['a', 'y'])
  })

  it('should handle mixed structures', () => {
    const input = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ],
      settings: {
        theme: 'dark',
        lang: 'en',
      },
    }
    const result = canonicalize(input)
    expect(Object.keys(result)).toEqual(['settings', 'users'])
    expect(Object.keys((result.settings as any))).toEqual(['lang', 'theme'])
    // Arrays should preserve order
    expect((result.users as any)[0]).toEqual({ age: 30, name: 'John' })
  })
})