import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        lib: {
            entry: 'galton.js',
            name: 'invcdfboard',
        },
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: 'invcdfboard.js',
                // manualChunks: {
                //     'matter-tools': ['matter-tools']
                // },
            },
        },
    },
});
