import { tsConfig, templateConfig } from '../../eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['projects/icon-viewer/tsconfig.app.json']
      }
    }
  },
  ...templateConfig
);
