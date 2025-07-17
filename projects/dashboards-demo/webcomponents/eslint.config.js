import typescriptEslint from 'typescript-eslint';
import { templateConfig, tsConfig } from '../../../eslint.config.js';

export default typescriptEslint.config(
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
