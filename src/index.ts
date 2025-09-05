// Re-export everything for backward compatibility
export { extractJson, getJsonLeafPaths } from './utils/json'
export type { VirtualKeysDtsOptions } from './types'
export type { JSONValue, JSONObject, JSONArray } from './types'
export { toDtsContent, toTypesContent, toConstsContent } from './generator'
export { default } from './plugin'