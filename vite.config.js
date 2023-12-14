import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        lib: {
            entry: 'galton.js',
            name: 'invcdfboard',
            fileName: 'invcdfboard',
            formats: ['es', 'umd'],
        },
        // rollupOptions: {
        //     output: {
        //         entryFileNames: 'invcdfboard.js',
        //         manualChunks: {
        //             'matter-tools': ['matter-tools']
        //         },
        //     },
        // },
    },
});
