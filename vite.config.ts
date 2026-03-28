import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { loadEnv, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import prerender from '@prerenderer/rollup-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBase = env.VITE_API_BASE_URL || 'https://dev.devine.kr';
  // Vercel(및 대부분의 CI) 빌드 이미지에서 Puppeteer/Chromium prerender는 자주 실패합니다.
  const prerenderEnabled =
    mode === 'production' &&
    process.env.VERCEL !== '1' &&
    process.env.SKIP_PRERENDER !== 'true';

  return {
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      tsconfigPaths(),
      prerenderEnabled &&
        prerender({
          routes: ['/', '/search/project', '/search/developer'],
          renderer: '@prerenderer/renderer-puppeteer',
          rendererOptions: {
            renderAfterDocumentEvent: 'prerender-ready',
            maxConcurrentRoutes: 1,
          },
          postProcess(renderedRoute) {
            renderedRoute.html = renderedRoute.html.replace(
              /http:\/\/(localhost|127\.0\.0\.1):\d+/gi,
              'https://www.devine.kr',
            );
          },
        }),
    ].filter(Boolean),
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
        },
        '/sse': {
          target: apiBase,
          changeOrigin: true,
          timeout: 0,
        },
      },
    },
  };
});
