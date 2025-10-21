import {describe, it, expect} from 'vitest'
import {extractJson, getJsonLeafPaths, canonicalize, detectKeyConflicts} from './json'
import complexInput from './json.test.json'
import { baseCompile} from '@intlify/message-compiler';
describe('extractJson', () => {
  it('should return correct for complex example', () => {


    const result = canonicalize(complexInput)
    expect(extractJson(result)).toEqual({ "en": { "App": { "fruits": { "apple": "Apple | Apples", "banana": "Banana | Bananas" }, "fruitsLabel": "There are {amount} {fruit}", "greetings": "Hello Typescript friends!", "menu": [ "home", "about" ] } }})
  })
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

    expect(result?.['de']).toEqual(resultExpected)
  })


})

describe('getJsonLeafPaths', () => {
  it('should handle empty object', () => {
    expect(getJsonLeafPaths({})).toEqual([])
  })

  it('should return paths for flat object', () => {
    const input = {a: 1, b: 'test', c: true}
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
    expect(paths).toContain('items.0')
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

  it('should include the path for empty objects', () => {
    const input = {
      a: {},
      b: {
        c: {}
      }
    };
    const paths = getJsonLeafPaths(input);
    expect(paths).toContain('a');
    expect(paths).toContain('b.c');
  });
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
    const input = {z: 1, a: 2, m: 3}
    const result = canonicalize(input)
    expect(Object.keys(result)).toEqual(['a', 'm', 'z'])
    expect(result).toEqual({a: 2, m: 3, z: 1})
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
        {name: 'John', age: 30},
        {name: 'Jane', age: 25},
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
    expect((result.users as any)[0]).toEqual({age: 30, name: 'John'})
  })
})

describe('detectKeyConflicts', () => {
  it('should detect no conflicts when all locales have same structure', () => {
    const messages = {
      en: {
        greeting: 'Hello',
        nested: {
          message: 'Message'
        }
      },
      fr: {
        greeting: 'Bonjour',
        nested: {
          message: 'Message'
        }
      }
    }
    expect(detectKeyConflicts(messages)).toEqual([])
  })

  it('should detect conflicts when key has different types', () => {
    const messages = {
      en: {
        item: 'Single item'
      },
      fr: {
        item: {
          one: 'Un article',
          many: 'Des articles'
        }
      }
    }
    const conflicts = detectKeyConflicts(messages)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toContain('Key "item"')
    expect(conflicts[0]).toContain('string in [en]')
    expect(conflicts[0]).toContain('object in [fr]')
  })

  it('should detect array vs string conflicts', () => {
    const messages = {
      en: {
        menu: ['Home', 'About', 'Contact']
      },
      de: {
        menu: 'Menu'
      }
    }
    const conflicts = detectKeyConflicts(messages)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toContain('Key "menu"')
    expect(conflicts[0]).toContain('array in [en]')
    expect(conflicts[0]).toContain('string in [de]')
  })

  it('should detect nested conflicts', () => {
    const messages = {
      en: {
        user: {
          profile: {
            name: 'Name'
          }
        }
      },
      es: {
        user: {
          profile: 'Perfil'
        }
      }
    }
    const conflicts = detectKeyConflicts(messages)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toContain('Key "user.profile"')
    expect(conflicts[0]).toContain('object in [en]')
    expect(conflicts[0]).toContain('string in [es]')
  })

  it('should handle multiple locales with same conflict', () => {
    const messages = {
      en: {
        item: 'Item'
      },
      de: {
        item: 'Artikel'
      },
      fr: {
        item: {
          one: 'Article',
          many: 'Articles'
        }
      },
      es: {
        item: {
          singular: 'Artículo',
          plural: 'Artículos'
        }
      }
    }
    const conflicts = detectKeyConflicts(messages)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toContain('string in [en, de]')
    expect(conflicts[0]).toContain('object in [fr, es]')
  })

  it('should ignore js-reserved key', () => {
    const messages = {
      en: {
        greeting: 'Hello'
      },
      'js-reserved': {
        greeting: {some: 'metadata'}
      }
    }
    expect(detectKeyConflicts(messages)).toEqual([])
  })

  it('should detect multiple different conflicts', () => {
    const messages = {
      en: {
        title: 'Title',
        menu: ['Home', 'About']
      },
      fr: {
        title: {
          main: 'Titre principal',
          sub: 'Sous-titre'
        },
        menu: 'Menu principal'
      }
    }
    const conflicts = detectKeyConflicts(messages)
    expect(conflicts).toHaveLength(2)
    expect(conflicts.some(c => c.includes('Key "title"'))).toBe(true)
    expect(conflicts.some(c => c.includes('Key "menu"'))).toBe(true)
  })
})
