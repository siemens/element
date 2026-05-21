import { tsConfig, templateConfig, indexBarrelConfig } from '../../eslint.config.js';
import defaultValuePlugin from '@siemens/eslint-plugin-defaultvalue';
import { defineConfig } from 'eslint/config';
export default defineConfig(
  {
    extends: [...tsConfig],
    plugins: {
      defaultValue: defaultValuePlugin
    },
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: ['projects/map-styles/tsconfig.lib.json', 'projects/map-styles/tsconfig.spec.json']
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
  ...templateConfig,
  ...indexBarrelConfig
);
