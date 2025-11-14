import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'scripts/**/*.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/loggerService.ts'], // Ignorar loggerService (console intencional)
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Prohibir console statements (excepto warn y error en desarrollo)
      'no-console': ['error', { allow: ['warn', 'error'] }],
      
      // Prohibir debugger
      'no-debugger': 'error',
      
      // Prohibir alert, confirm, prompt
      'no-alert': 'error',
      
      // Detectar imports no usados
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      
      // Preferir const sobre let
      'prefer-const': 'error',
      
      // No permitir var
      'no-var': 'error',
      
      // Espacios consistentes
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Prohibir código comentado
      'no-warning-comments': ['warn', { terms: ['TODO', 'FIXME', 'XXX'], location: 'start' }],
    },
  },
])
