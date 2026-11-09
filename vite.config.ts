import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { gchDevServerPlugin } from './src/server/gchDevServerPlugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GCH_ROOT', 'GCH_LOGS_DIR', 'GCH_WEB_PORT']) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  const port = Number(process.env.GCH_WEB_PORT) || 5174;

  return {
    plugins: [react(), tailwindcss(), gchDevServerPlugin()],
    server: {
      port,
      strictPort: true,
    },
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      environmentMatchGlobs: [
        ['src/components/**', 'jsdom'],
        ['src/views/**', 'jsdom'],
        ['src/hooks/**', 'jsdom'],
      ],
    },
  };
});
