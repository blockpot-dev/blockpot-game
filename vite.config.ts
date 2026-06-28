import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        react(),
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'baseline-widely-available', // More specific target to avoid initialization issues
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 1000, // Increase since we're not manually chunking
        minify: 'esbuild', // Keep esbuild but with safer settings
        reportCompressedSize: true, // Disable for faster builds
        rollupOptions: {
            output: {
                // Disable manual chunks to avoid circular dependency issues
                // Let Vite's automatic chunking handle it with lazy loading
                
                // Optimize asset names for better caching
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name?.split('.')
                    const extType = info?.[info.length - 1]
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
                        return 'assets/images/[name]-[hash][extname]'
                    }
                    if (/woff|woff2|eot|ttf|otf/i.test(extType ?? '')) {
                        return 'assets/fonts/[name]-[hash][extname]'
                    }
                    return 'assets/[name]-[hash][extname]'
                },
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                generatedCode: {
                    constBindings: true, // Use const for better optimization
                },
            },
            // Prevent hoisting issues
            treeshake: true,
            onwarn(warning, warn) {
                // `ox` (a viem dependency) ships /*#__PURE__*/ annotations in
                // positions Rollup cannot interpret; the comment is harmlessly
                // stripped. Silence only that specific third-party annotation
                // notice and forward every other warning untouched.
                if (
                    (warning.code === 'INVALID_ANNOTATION' ||
                        warning.message?.includes(
                            'contains an annotation that Rollup cannot interpret'
                        )) &&
                    (warning.id?.includes('node_modules') ||
                        warning.message?.includes('node_modules'))
                ) {
                    return
                }
                warn(warning)
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true, // Handle mixed module formats
        },
    },
    // Optimize dependencies pre-bundling
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'viem',
            'wagmi',
            '@tanstack/react-query',
            '@tanstack/react-router',
        ],
        exclude: ['@tanstack/router-devtools'],
    },
    server: {
        port: 3000,
        open: true,
    },
    define: {
        'process.env': {},
    },
})