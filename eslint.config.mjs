import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import globals from 'globals'

export default [
    {
        ignores: [
            'dist/**',
            'build/**',
            'node_modules/**',
            'src/routes/routeTree.gen.ts',
            'storybook-static/**',
            'src/components/blockpot/governance/**',
            'src/components/blockpot/earn/**',
            'src/components/blockpot/referrals/**',
            'src/routes/governance/**',
            'src/routes/earn.tsx',
            'src/routes/referrals.tsx',
            'src/hooks/contracts/block-pot-token/**',
            'src/hooks/contracts/block-pot-reward-tracker/**',
            'src/hooks/contracts/block-pot-referral-manager/**',
            'src/hooks/contracts/block-pot-config-manager/**',
            'src/hooks/contracts/write/**',
            'src/hooks/governance/**',
            'src/hooks/entry/useApplyReferralCode.ts',
            'src/hooks/contracts/draw/useLotteryDiscounts.ts',
            'src/hooks/contracts/draw/actions/useStartDraw.ts',
            'src/types/governance/**',
            'src/utilities/governance/**',
            'src/providers/PinataStorageProvider.tsx',
            'src/providers/SettingsProvider.tsx',
            'src/components/blockpot/modals/BPTDialog/**',
            'src/components/blockpot/entries/EntryOptions/ApplyReferralCode/**',
            'src/components/blockpot/transparency/ContributorPayouts.tsx',
            'src/hooks/contracts/transparency/useContributorInfo.ts',
            'src/hooks/contracts/transparency/useContributorClaim.ts',
            'src/hooks/contracts/transparency/useContributorPayouts.ts',
        ],
    },
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
                React: 'readonly',
                JSX: 'readonly',
                NodeJS: 'readonly',
                IDBValidKey: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
            'react-refresh': reactRefreshPlugin,
            'unused-imports': unusedImportsPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            'semi': ['error', 'never'],
            'no-multi-spaces': ['error'],
            'quotes': ['error', 'single'],
            'indent': ['error', 4],
            'no-case-declarations': 'off',
            'no-empty-pattern': 'off',
            'unused-imports/no-unused-imports': 'error',
            'import/no-anonymous-default-export': 'off',
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/static-components': 'off',
            'react-refresh/only-export-components': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_|^props$',
                varsIgnorePattern: '^_',
                caughtErrors: 'none',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'warn',
        },
    },
    {
        files: ['**/*.story.tsx', '**/*.stories.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    {
        files: ['src/providers/**/*.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', 'src/test/**'],
        rules: {
            'unused-imports/no-unused-imports': 'off',
            'react-refresh/only-export-components': 'off',
        },
    },
]
