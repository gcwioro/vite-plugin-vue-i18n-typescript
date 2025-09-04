import { defineConfig } from 'vitest/config'
import path from "path";

export default defineConfig({

  test: {
    testTimeout: 10_000,
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
