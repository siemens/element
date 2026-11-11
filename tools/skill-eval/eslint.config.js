import { tsConfig } from '../../eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  extends: [...tsConfig],
  files: ['**/*.ts'],
  rules: {
    '@angular-eslint/sort-keys-in-type-decorator': 'off',
    '@typescript-eslint/no-floating-promises': 'error'
  },
  languageOptions: {
    parserOptions: {
      project: ['tools/skill-eval/tsconfig.json']
    }
  }
});
