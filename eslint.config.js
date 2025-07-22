import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from 'typescript-eslint';
import angularTypescriptConfig from '@siemens/eslint-config-angular';
import angularTemplateConfig from '@siemens/eslint-config-angular/template';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import eslintPluginHeaders from 'eslint-plugin-headers';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tsConfig = typescriptEslint.config({
  extends: [...angularTypescriptConfig],
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: ['tsconfig.json'],
      tsconfigRootDir: __dirname
    }
  },
  plugins: {
    'tsdoc': tsdocPlugin,
    'headers': eslintPluginHeaders
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['off'],
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase'
      }
    ],
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case'
      }
    ],
    '@angular-eslint/prefer-signals': [
      'error',
      { preferInputSignals: false, preferQuerySignals: false }
    ],
    '@angular-eslint/prefer-output-emitter-ref': ['off'],
    '@angular-eslint/no-experimental': ['off'],
    '@angular-eslint/no-developer-preview': ['off'],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error']
      }
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@angular/localize/init',
            importNames: ['$localize'],
            message: 'Please use $localize from the global scope. No import required'
          },
          {
            name: '@angular/cdk/coercion',
            message: 'Use the convert functions from @angular/core instead.'
          },
          {
            name: '@siemens/element-ng',
            message: 'Use the secondary entrypoints instead.'
          }
        ]
      }
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowDirectConstAssertionInArrowFunctions: true
      }
    ],
    'tsdoc/syntax': ['error'],
    '@typescript-eslint/no-deprecated': ['error'],
    'headers/header-format': [
      'error',
      {
        'source': 'string',
        'content': 'Copyright (c) Siemens 2016 - 2025\nSPDX-License-Identifier: MIT'
      }
    ]
  }
});

export const templateConfig = typescriptEslint.config({
  extends: [...angularTemplateConfig],
  files: ['**/*.html'],
  rules: {
    '@angular-eslint/template/prefer-ngsrc': ['off'],
    '@angular-eslint/template/no-inline-styles': ['off'],
    '@angular-eslint/template/interactive-supports-focus': ['off'],
    '@angular-eslint/template/prefer-template-literal': ['off'],
    '@angular-eslint/template/elements-content': [
      'error',
      {
        allowList: [
          'siHeaderLogo',
          'aria-label',
          'innerHtml',
          'innerHTML',
          'innerText',
          'outerHTML',
          'title',
          'si-tab-next'
        ]
      }
    ]
  }
});

export default typescriptEslint.config(...tsConfig, ...templateConfig);
