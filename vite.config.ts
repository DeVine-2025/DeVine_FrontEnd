import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { loadEnv, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // env 미설정 시 기본값 (도메인 변경 대응)
  const apiBase = env.VITE_API_BASE_URL || 'https://dev.devine.kr';

  return {
    plugins: [react(), svgr(), tailwindcss(), tsconfigPaths()],
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
