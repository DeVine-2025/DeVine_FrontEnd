import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { loadEnv, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'https://api.devine.kr';

  return {
    plugins: [react(), svgr(), tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
  };
});
