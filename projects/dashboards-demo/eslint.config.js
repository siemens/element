import { tsConfig, templateConfig } from '../../eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    ignores: [
      '**/environments/environment.prod.ts',
      '**/environments/environment.esm.ts',
      '**/environments/environment.esm.prod.ts'
    ],
    languageOptions: {
      parserOptions: {
        project: ['projects/dashboards-demo/tsconfig.app.json']
      }
    },
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ]
    }
  },
  ...templateConfig
);
