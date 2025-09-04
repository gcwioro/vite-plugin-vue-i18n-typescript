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

  it('should work correctly', () => {
    const input = {
      "de": {
        "greeting": {
          "type": 0,
          "start": 0,
          "end": 5,
          "loc": {
            "start": {
              "line": 1,
              "column": 1,
              "offset": 0
            },
            "end": {
              "line": 1,
              "column": 6,
              "offset": 5
            },
            "source": "Hallo"
          },
          "body": {
            "type": 2,
            "start": 0,
            "end": 5,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 6,
                "offset": 5
              }
            },
            "items": [
              {
                "type": 3,
                "start": 0,
                "end": 5,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 6,
                    "offset": 5
                  }
                }
              }
            ],
            "static": "Hallo"
          }
        },
        "fruits": [
          {
            "type": 0,
            "start": 0,
            "end": 5,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 6,
                "offset": 5
              },
              "source": "Apfel"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 5,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 6,
                  "offset": 5
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 5,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 6,
                      "offset": 5
                    }
                  }
                }
              ],
              "static": "Apfel"
            }
          },
          {
            "type": 0,
            "start": 0,
            "end": 6,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 7,
                "offset": 6
              },
              "source": "Banane"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 6,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 7,
                  "offset": 6
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 6,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 7,
                      "offset": 6
                    }
                  }
                }
              ],
              "static": "Banane"
            }
          }
        ],
        "nested": {
          "title": {
            "type": 0,
            "start": 0,
            "end": 10,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 11,
                "offset": 10
              },
              "source": "Willkommen"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 10,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 11,
                  "offset": 10
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 10,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 11,
                      "offset": 10
                    }
                  }
                }
              ],
              "static": "Willkommen"
            }
          },
          "menu": [
            {
              "type": 0,
              "start": 0,
              "end": 10,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 11,
                  "offset": 10
                },
                "source": "Startseite"
              },
              "body": {
                "type": 2,
                "start": 0,
                "end": 10,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 11,
                    "offset": 10
                  }
                },
                "items": [
                  {
                    "type": 3,
                    "start": 0,
                    "end": 10,
                    "loc": {
                      "start": {
                        "line": 1,
                        "column": 1,
                        "offset": 0
                      },
                      "end": {
                        "line": 1,
                        "column": 11,
                        "offset": 10
                      }
                    }
                  }
                ],
                "static": "Startseite"
              }
            },
            {
              "type": 0,
              "start": 0,
              "end": 4,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 5,
                  "offset": 4
                },
                "source": "Über"
              },
              "body": {
                "type": 2,
                "start": 0,
                "end": 4,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 5,
                    "offset": 4
                  }
                },
                "items": [
                  {
                    "type": 3,
                    "start": 0,
                    "end": 4,
                    "loc": {
                      "start": {
                        "line": 1,
                        "column": 1,
                        "offset": 0
                      },
                      "end": {
                        "line": 1,
                        "column": 5,
                        "offset": 4
                      }
                    }
                  }
                ],
                "static": "Über"
              }
            }
          ]
        }
      },
      "en": {
        "greeting": {
          "type": 0,
          "start": 0,
          "end": 5,
          "loc": {
            "start": {
              "line": 1,
              "column": 1,
              "offset": 0
            },
            "end": {
              "line": 1,
              "column": 6,
              "offset": 5
            },
            "source": "Hello"
          },
          "body": {
            "type": 2,
            "start": 0,
            "end": 5,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 6,
                "offset": 5
              }
            },
            "items": [
              {
                "type": 3,
                "start": 0,
                "end": 5,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 6,
                    "offset": 5
                  }
                }
              }
            ],
            "static": "Hello"
          }
        },
        "fruits": [
          {
            "type": 0,
            "start": 0,
            "end": 5,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 6,
                "offset": 5
              },
              "source": "apple"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 5,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 6,
                  "offset": 5
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 5,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 6,
                      "offset": 5
                    }
                  }
                }
              ],
              "static": "apple"
            }
          },
          {
            "type": 0,
            "start": 0,
            "end": 6,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 7,
                "offset": 6
              },
              "source": "banana"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 6,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 7,
                  "offset": 6
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 6,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 7,
                      "offset": 6
                    }
                  }
                }
              ],
              "static": "banana"
            }
          }
        ],
        "nested": {
          "title": {
            "type": 0,
            "start": 0,
            "end": 7,
            "loc": {
              "start": {
                "line": 1,
                "column": 1,
                "offset": 0
              },
              "end": {
                "line": 1,
                "column": 8,
                "offset": 7
              },
              "source": "Welcome"
            },
            "body": {
              "type": 2,
              "start": 0,
              "end": 7,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 8,
                  "offset": 7
                }
              },
              "items": [
                {
                  "type": 3,
                  "start": 0,
                  "end": 7,
                  "loc": {
                    "start": {
                      "line": 1,
                      "column": 1,
                      "offset": 0
                    },
                    "end": {
                      "line": 1,
                      "column": 8,
                      "offset": 7
                    }
                  }
                }
              ],
              "static": "Welcome"
            }
          },
          "menu": [
            {
              "type": 0,
              "start": 0,
              "end": 4,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 5,
                  "offset": 4
                },
                "source": "home"
              },
              "body": {
                "type": 2,
                "start": 0,
                "end": 4,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 5,
                    "offset": 4
                  }
                },
                "items": [
                  {
                    "type": 3,
                    "start": 0,
                    "end": 4,
                    "loc": {
                      "start": {
                        "line": 1,
                        "column": 1,
                        "offset": 0
                      },
                      "end": {
                        "line": 1,
                        "column": 5,
                        "offset": 4
                      }
                    }
                  }
                ],
                "static": "home"
              }
            },
            {
              "type": 0,
              "start": 0,
              "end": 5,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 6,
                  "offset": 5
                },
                "source": "about"
              },
              "body": {
                "type": 2,
                "start": 0,
                "end": 5,
                "loc": {
                  "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                  },
                  "end": {
                    "line": 1,
                    "column": 6,
                    "offset": 5
                  }
                },
                "items": [
                  {
                    "type": 3,
                    "start": 0,
                    "end": 5,
                    "loc": {
                      "start": {
                        "line": 1,
                        "column": 1,
                        "offset": 0
                      },
                      "end": {
                        "line": 1,
                        "column": 6,
                        "offset": 5
                      }
                    }
                  }
                ],
                "static": "about"
              }
            }
          ]
        }
      }
    }

    const resultExpected = {
      "greeting": "Hallo",
      "fruits": ["Apfel", "Banane"],
      "nested": {
        "title": "Willkommen",
        "menu": ["Startseite", "Über"]
      }
    }

    const result = extractJson(input);

    expect(result).toEqual(resultExpected)
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
