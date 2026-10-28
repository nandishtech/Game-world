import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Lightweight Vite dev plugin to execute /api/auth handlers during local development
const localApiPlugin = (): Plugin => ({
  name: 'local-api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url?.split('?')[0];
      if (url === '/api/auth/register') {
        const mod = await server.ssrLoadModule('/api/auth/register.ts');
        return mod.default(req, res);
      }
      if (url === '/api/auth/login') {
        const mod = await server.ssrLoadModule('/api/auth/login.ts');
        return mod.default(req, res);
      }
      if (url === '/api/auth/me') {
        const mod = await server.ssrLoadModule('/api/auth/me.ts');
        return mod.default(req, res);
      }
      if (url === '/api/auth/profile') {
        const mod = await server.ssrLoadModule('/api/auth/profile.ts');
        return mod.default(req, res);
      }
      if (url === '/api/auth/logout') {
        const mod = await server.ssrLoadModule('/api/auth/logout.ts');
        return mod.default(req, res);
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localApiPlugin()
  ],
  build: {
    cssMinify: 'esbuild'
  }
});
