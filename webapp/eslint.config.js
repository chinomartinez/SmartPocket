import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
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
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name='slice'][callee.object.callee.property.name='toISOString']",
          message: 'Usá los helpers de @/utils/dateHelpers en lugar de toISOString().slice().',
        },
        {
          selector:
            "CallExpression[callee.property.name='slice'][arguments.0.value=0][arguments.1.value=10]",
          message: 'Usá dateOnlyFromDateTime() o toDateOnly() de @/utils/dateHelpers.',
        },
        {
          selector: "CallExpression[callee.property.name='split'][arguments.0.value='T']",
          message: 'Usá dateOnlyFromDateTime() de @/utils/dateHelpers.',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.0.type='Literal']",
          message: 'Parseá fechas con los helpers de @/utils/dateHelpers.',
        },
      ],
    },
  },
])
