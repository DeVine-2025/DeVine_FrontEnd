import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBase = env.VITE_API_BASE_URL || 'https://api.devine.kr';

  const masterJwt = env.DEV_MASTER_JWT;

  const attachAuthHeader = (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: any) => {
      if (masterJwt) {
        proxyReq.setHeader('Authorization', `Bearer ${masterJwt}`);
      }
      proxyReq.setHeader('accept', '*/*');
    });
  };

  return {
    plugins: [react(), svgr(), tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          configure: attachAuthHeader,
        },
        '/sse': {
          target: apiBase,
          changeOrigin: true,
          configure: attachAuthHeader,
        },
      },
    },
  };
});
