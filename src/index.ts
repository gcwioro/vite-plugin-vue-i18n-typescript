
// Re-export everything for backward compatibility
export { extractJson, getJsonLeafPaths } from './utils/json'

export {toTypesContent} from './generation/generator'


// Export programmatic API
export {generateI18nTypes} from './api'

export type * from './types'
export {vitePluginVueI18nTypes as default} from './plugin'
// export * from './api.ts'
// export * from './cli.ts'
