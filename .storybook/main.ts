import type { StorybookConfig } from '@storybook/react-vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
    stories: [
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
        '../src/**/*.story.@(js|jsx|ts|tsx)',
    ],
    addons: [],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    staticDirs: [
        {
            from: '../public/fonts',
            to: 'public/fonts'
        },
        '../public'
    ],
    viteFinal: async (config, { configType: _configType }) => {
    // Merge Vite config from vite.config.ts
        const plugins = config.plugins || []
    
        // Only add nodePolyfills if not already present
        const hasNodePolyfills = plugins.some(
            (plugin) => plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite-plugin-node-polyfills'
        )
    
        if (!hasNodePolyfills) {
            plugins.push(
                nodePolyfills({
                    globals: {
                        Buffer: true,
                        global: true,
                        process: true,
                    },
                })
            )
        }
    
        config.plugins = plugins
    
        // Add path alias
        config.resolve = config.resolve || {}
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            '@': path.resolve(__dirname, '../src'),
        }
    
        // Add define for process.env
        config.define = {
            ...(config.define || {}),
            'process.env': {},
        }
    
        return config
    },
}

export default config
