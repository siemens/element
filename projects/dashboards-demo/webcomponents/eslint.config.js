import { templateConfig, tsConfig } from '../../../eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [
          'projects/dashboards-demo/webcomponents/tsconfig.app.json',
          'projects/dashboards-demo/webcomponents/tsconfig.spec.json'
        ]
      }
    }
  },
  ...templateConfig
);
