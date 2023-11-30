import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'matter-js': ['matter-js'],
                    '@stdlib/dist-stats-base-dists-flat': ['@stdlib/dist-stats-base-dists-flat'],
                    'matter-tools': ['matter-tools']
                }
            }
        }
    }
});
