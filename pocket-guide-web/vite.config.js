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
                    // API calls - network first, fallback to cache
                    {
                        urlPattern: /^https:\/\/api\..*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            }
                        }
                    },
                    // Images - cache first, fallback to network
                    {
                        urlPattern: /^https:\/\/(images|cdn|unsplash|lh3)\.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                            }
                        }
                    },
                    // Firebase - network first
                    {
                        urlPattern: /^https:\/\/firebaseapp\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firebase-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 // 1 hour
                            }
                        }
                    },
                    // Google fonts - cache first
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts-cache',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
