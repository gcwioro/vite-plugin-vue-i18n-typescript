// Re-export everything for backward compatibility
export { extractJson, getJsonLeafPaths } from './utils/json'
export type { VirtualKeysDtsOptions } from './types'
export type { JSONValue, JSONObject, JSONArray } from './types'
export {default, vitePluginVueI18nTypes} from './plugin'

// Export programmatic API
export {generateI18nTypes} from './api'
export type {GenerateTypesOptions, GenerateTypesResult} from './api'
