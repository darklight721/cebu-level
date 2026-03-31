import { withRsbuildConfig } from '@rstest/adapter-rsbuild'
import { defineConfig } from '@rstest/core'

export default defineConfig({
  extends: withRsbuildConfig(),
  testEnvironment: 'happy-dom',
  setupFiles: ['./rstest.setup.ts'],
  coverage: {
    enabled: true,
    provider: 'istanbul',
    reporters: ['text', 'html'],
    include: ['src/**'],
    exclude: ['**/*.d.ts', '**/*.css', 'src/main.tsx'],
  },
})
