import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for React + TS
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        globals: true,
    },
});
