

export const shallowMerge = <T extends Record<string, any>>(a: T, b: T) => Object.assign({}, a, b);

export const toArray = <T, >(v?: T | T[]) => (Array.isArray(v) ? v : v ? [v] : []);

