import { describe, it, expect } from 'vitest'
import { fnv1a32 } from './hash'

describe('fnv1a32', () => {
  it('should return consistent hash for same input', () => {
    const input = 'hello world'
    const hash1 = fnv1a32(input)
    const hash2 = fnv1a32(input)
    expect(hash1).toBe(hash2)
  })

  it('should return different hashes for different inputs', () => {
    const hash1 = fnv1a32('hello')
    const hash2 = fnv1a32('world')
    expect(hash1).not.toBe(hash2)
  })

  it('should return 8-character hexadecimal string', () => {
    const hash = fnv1a32('test')
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
    expect(hash.length).toBe(8)
  })

  it('should handle empty string', () => {
    const hash = fnv1a32('')
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
    // FNV-1a hash of empty string
    expect(hash).toBe('811c9dc5')
  })

  it('should handle unicode characters', () => {
    const hash1 = fnv1a32('café')
    const hash2 = fnv1a32('cafe')
    expect(hash1).not.toBe(hash2)
    expect(hash1).toMatch(/^[0-9a-f]{8}$/)
  })

  it('should handle long strings', () => {
    const longString = 'a'.repeat(10000)
    const hash = fnv1a32(longString)
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('should be case sensitive', () => {
    const hash1 = fnv1a32('Hello')
    const hash2 = fnv1a32('hello')
    expect(hash1).not.toBe(hash2)
  })

  it('should handle special characters', () => {
    const input = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~'
    const hash = fnv1a32(input)
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })
})