import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {} from '@vitest/browser/providers/playwright';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), svgr()],
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['tests/bookmark.browser.test.tsx'],
    testTimeout: 10000,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      screenshotDirectory: join(tmpdir(), 'devine-bookmark-tests'),
      instances: [
        {
          browser: 'chromium',
          name: 'bookmark-desktop',
          launch: { channel: 'chrome' },
          viewport: { width: 1280, height: 900 },
        },
        {
          browser: 'chromium',
          name: 'bookmark-touch',
          launch: { channel: 'chrome' },
          viewport: { width: 390, height: 844 },
          context: { isMobile: true, hasTouch: true },
        },
      ],
    },
  },
});
