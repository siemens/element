import typescriptEslint from 'typescript-eslint';
import { tsConfig, templateConfig } from '../../eslint.config.js';

export default typescriptEslint.config(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [
          'projects/dashboards-demo/tsconfig.app.json',
          'projects/dashboards-demo/tsconfig.spec.json'
        ]
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
