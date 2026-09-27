import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the `@/*` path mapping in tsconfig.json. Vitest does not read
      // tsconfig `paths`, so without this every `import ... from '@/lib/...'`
      // in a test fails to resolve and the whole suite collects zero tests.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
  },
})
