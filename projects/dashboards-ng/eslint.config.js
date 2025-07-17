import typescriptEslint from 'typescript-eslint';
import { tsConfig, templateConfig } from '../../eslint.config.js';
import defaultValuePlugin from '@siemens/eslint-plugin-defaultvalue';
export default typescriptEslint.config(
  {
    extends: [...tsConfig],
    plugins: {
      defaultValue: defaultValuePlugin
    },
    files: ['**/*.ts'],
    ignores: ['**/test-helpers/*.ts'],

    languageOptions: {
      parserOptions: {
        project: [
          'projects/dashboards-ng/tsconfig.lib.json',
          'projects/dashboards-ng/tsconfig.spec.json'
        ]
      }
    },
    rules: {
      'defaultValue/tsdoc-defaultValue-annotation': 'error',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'si',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'si',
          style: 'camelCase'
        }
      ],
      '@typescript-eslint/no-deprecated': ['off']
    }
  },
  ...templateConfig
);
