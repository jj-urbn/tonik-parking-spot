import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import tailwind from 'eslint-plugin-tailwindcss'
import { fileURLToPath } from 'node:url'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.tsx'],
    extends: [tailwind.configs['flat/recommended']],
    settings: {
      // Tailwind v4 keeps its config in the CSS @theme block; point the
      // plugin at our entry stylesheet so no-custom-classname knows our tokens.
      tailwindcss: {
        config: fileURLToPath(new URL('./src/index.css', import.meta.url)),
      },
    },
  },
])
