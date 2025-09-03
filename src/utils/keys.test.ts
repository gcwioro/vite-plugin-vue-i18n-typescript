import { describe, it, expect } from 'vitest'
import { defaultTransformKeys } from './keys'

describe('defaultTransformKeys', () => {
  it('should return empty array for empty input', () => {
    expect(defaultTransformKeys([])).toEqual([])
  })

  it('should remove duplicates', () => {
    const input = ['a', 'b', 'a', 'c', 'b']
    expect(defaultTransformKeys(input)).toEqual(['a', 'b', 'c'])
  })

  it('should sort keys alphabetically', () => {
    const input = ['z', 'a', 'm', 'b']
    expect(defaultTransformKeys(input)).toEqual(['a', 'b', 'm', 'z'])
  })

  it('should filter out empty strings', () => {
    const input = ['a', '', 'b', '', 'c']
    expect(defaultTransformKeys(input)).toEqual(['a', 'b', 'c'])
  })

  it('should handle special characters', () => {
    const input = ['user.name', 'user_id', 'user-email', 'user/profile']
    const result = defaultTransformKeys(input)
    expect(result).toEqual(['user-email', 'user.name', 'user/profile', 'user_id'])
  })

  it('should handle dot-notated paths', () => {
    const input = [
      'forms.validation.required',
      'forms.submit',
      'navigation.home',
      'forms.validation.email',
      'navigation.about',
    ]
    const result = defaultTransformKeys(input)
    expect(result).toEqual([
      'forms.submit',
      'forms.validation.email',
      'forms.validation.required',
      'navigation.about',
      'navigation.home',
    ])
  })

  it('should handle unicode characters', () => {
    const input = ['über', 'éclair', 'café', 'naïve']
    const result = defaultTransformKeys(input)
    expect(result).toEqual(['café', 'naïve', 'éclair', 'über'])
  })

  it('should dedupe and sort complex keys', () => {
    const input = [
      'a.b.c',
      'a.b.c',
      'z.y.x',
      'a.b.d',
      'm.n.o',
      'a.b.d',
    ]
    const result = defaultTransformKeys(input)
    expect(result).toEqual(['a.b.c', 'a.b.d', 'm.n.o', 'z.y.x'])
  })
})