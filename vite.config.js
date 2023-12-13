import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            output: {
                // one bundle file
                entryFileNames: '[name].js',
                manualChunks: {
                    'matter-tools': ['matter-tools']
                }
            },
        },
    },
});
