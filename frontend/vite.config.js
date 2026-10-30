import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The preview proxy serves the app over https on port 443 of the public host,
// so HMR must target that port instead of the internal dev-server port.
// Only enabled inside the Base44 sandbox (BASE44_PREVIEW_MODE=1).
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(previewMode ? { hmr: { clientPort: 443 } } : {}),
    proxy: {
      '/api': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
    },
  },
});
