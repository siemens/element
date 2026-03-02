import { tsConfig, templateConfig } from '../../eslint.config.js';
import defaultValuePlugin from '@siemens/eslint-plugin-defaultvalue';
import { defineConfig } from 'eslint/config';
export default defineConfig(
  {
    extends: [...tsConfig],
    plugins: {
      defaultValue: defaultValuePlugin
    },
    files: ['**/*.ts'],
    ignores: ['**/test-helpers/*.ts'],

    languageOptions: {
      parserOptions: {
        project: ['projects/maps-ng/tsconfig.lib.json', 'projects/maps-ng/tsconfig.spec.json']
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
      ]
    }
  },
  ...templateConfig
);
