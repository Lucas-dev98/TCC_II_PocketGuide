import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Pocket Guide',
                short_name: 'Pocket Guide',
                description: 'AI-powered travel itinerary app',
                theme_color: '#3B82F6',
                background_color: '#FFFFFF',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\..*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        open: true,
        strictPort: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        // Increased to 1700 kB to accommodate mapbox library (1.6 MB)
        // This is reasonable for a complex app with mapping capabilities
        // The warning is suppressed when chunk size is within limit
        chunkSizeWarningLimit: 1700,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    // Vendor chunks for better caching
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'react-vendor';
                    }
                    if (id.includes('node_modules/firebase')) {
                        return 'firebase';
                    }
                    if (id.includes('node_modules/mapbox')) {
                        return 'mapbox';
                    }
                    if (id.includes('node_modules/@react-google-maps')) {
                        return 'google-maps';
                    }
                    if (id.includes('node_modules/zustand')) {
                        return 'zustand';
                    }
                    if (id.includes('node_modules/tailwindcss') || id.includes('node_modules/lucide-react')) {
                        return 'ui-utils';
                    }
                }
            }
        }
    }
});
