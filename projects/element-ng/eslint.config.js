import { tsConfig, templateConfig } from '../../eslint.config.js';
import defaultValuePlugin from '@siemens/eslint-plugin-defaultvalue';
import { defineConfig, globalIgnores } from 'eslint/config';
export default defineConfig(
  globalIgnores(['**/schematics/**/files/**']),
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
          'projects/element-ng/tsconfig.lib.json',
          'projects/element-ng/tsconfig.spec.json',
          'projects/element-ng/tsconfig.schematics.json',
          'projects/element-ng/tsconfig.schematics.spec.json'
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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: "Don't declare enums"
        }
      ],
      '@typescript-eslint/no-deprecated': ['off']
    }
  },
  ...templateConfig
);
