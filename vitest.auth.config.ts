import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['tests/auth-*.test.{ts,tsx}'],
    clearMocks: true,
  },
});
