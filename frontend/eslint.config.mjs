import antfu from '@antfu/eslint-config';
import pluginNext from '@next/eslint-plugin-next';

export default antfu({
    react: true,
    // formatters: true,
    isInEditor: false,
    stylistic: {
        indent: 4,
        quotes: 'single',
        semi: true,
        jsx: true,
    },
    plugins: {
        '@next/next': pluginNext,
    },
    rules: {
        'ts/ban-ts-comment': 'off',
        'no-console': 'warn',
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'warn',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],
        'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
        'style/arrow-parens': ['warn', 'always'],
        'prefer-promise-reject-errors': 'off',
        'node/prefer-global/process': ['error', 'always'],
        ...pluginNext.configs.recommended.rules,
        'perfectionist/sort-imports': 'warn',
        'import/newline-after-import': 'warn',
        // very slow rules
        'import/no-duplicates': 'off',
        'import/no-self-import': 'off',
    },
    typescript: {
        overrides: {
            'ts/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
        },
    },
    ignores: [
        'node_modules/',
        'node_modules/**/*',
        'src/data/*',
        'public/',
        'public/**/*',
    ],
});
