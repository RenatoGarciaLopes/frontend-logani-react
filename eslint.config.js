import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
// Nota: eslint-config-airbnb não é compatível nativamente com flat config
// Se você precisar das regras do Airbnb, considere usar:
// - eslint-plugin-react com configurações manuais
// - Ou aguardar versão compatível com flat config
// import airbnb from "eslint-config-airbnb";
// import airbnbTypescript from "eslint-config-airbnb-typescript";
import react from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: ['dist'],
  },
  // Prettier desabilita regras conflitantes - deve vir antes das outras regras
  prettier,
  // Aplica a configuração recomendada do TypeScript ESLint (inclui parser e plugin)
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.app.json',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      perfectionist,
      'unused-imports': unusedImports,
      react,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'no-alert': 'off',
      camelcase: 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'no-restricted-exports': 'off',
      'react/no-children-prop': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'react/no-array-index-key': 'off',
      'no-promise-executor-return': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'import/prefer-default-export': 'off',
      'react/function-component-definition': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-useless-fragment': [
        'warn',
        {
          allowExpressions: true,
        },
      ],
      'prefer-destructuring': [
        'warn',
        {
          object: true,
          array: false,
        },
      ],
      'react/no-unstable-nested-components': [
        'warn',
        {
          allowAsProps: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
        },
      ],
      'react/jsx-no-duplicate-props': [
        'warn',
        {
          ignoreCase: false,
        },
      ],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'off',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
          newlinesBetween: 'always',
          groups: [
            ['builtin', 'external'],
            'custom-mui',
            'custom-routes',
            'custom-hooks',
            'custom-utils',
            'internal',
            'custom-components',
            'custom-sections',
            'custom-types',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          customGroups: {
            value: {
              'custom-mui': '^@mui/',
              'custom-routes': '^src/routes/',
              'custom-hooks': '^src/hooks/',
              'custom-utils': '^src/utils/',
              'custom-components': '^src/components/',
              'custom-sections': '^src/sections/',
              'custom-types': '^src/types/',
            },
          },
          internalPattern: ['^src/'],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  }
);
