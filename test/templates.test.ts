import {describe, expect, it} from 'vitest'
import {CombinedMessages} from '../src/core/combined-messages'
import {generateModuleArtifacts} from '../src/generator'

const sampleMessages = {
  en: {
    greeting: 'Hello',
    nested: {
      welcome: 'Welcome',
    },
  },
  de: {
    greeting: 'Hallo',
    nested: {
      welcome: 'Willkommen',
    },
  },
}

describe('template rendering', () => {
  it('renders messages and runtime modules', () => {
    const combined = new CombinedMessages(sampleMessages, 'en')
    const artifacts = generateModuleArtifacts({combinedMessages: combined})

    expect(artifacts.messages.ts).toMatchSnapshot('messages-ts')
    expect(artifacts.runtime.ts).toMatchSnapshot('runtime-ts')
    expect(artifacts.typesContent).toMatchSnapshot('types-dts')
  })
})
