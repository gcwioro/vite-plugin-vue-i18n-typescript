// Re-export everything for backward compatibility
export { extractJson, getJsonLeafPaths } from './utils/json'
export type { VirtualKeysDtsOptions } from './types'
export type { JSONValue, JSONObject, JSONArray } from './types'
export {toTypesContent} from './generator'
export { default } from './plugin'

// Export programmatic API
export {generateI18nTypes} from './api'
export type {GenerateTypesOptions, GenerateTypesResult} from './api'
