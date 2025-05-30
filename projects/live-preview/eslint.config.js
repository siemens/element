import typescriptEslint from 'typescript-eslint';
import { tsConfig, templateConfig } from '../../eslint.config.js';

export default typescriptEslint.config(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: [
          'projects/live-preview/tsconfig.lib.json',
          'projects/live-preview/tsconfig.spec.json'
        ]
      }
    },
    rules: {
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
