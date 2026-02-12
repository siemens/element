import path from 'path';
import { fileURLToPath } from 'url';
import angularTypescriptConfig from '@siemens/eslint-config-angular';
import angularTemplateConfig from '@siemens/eslint-config-angular/template';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import eslintPluginHeaders from 'eslint-plugin-headers';
import { defineConfig } from 'eslint/config';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tsConfig = defineConfig({
  extends: [...angularTypescriptConfig],
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: ['src/tsconfig.app.json'],
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
    '@angular-eslint/no-experimental': ['off'],
    '@angular-eslint/no-developer-preview': ['error'],
    '@angular-eslint/prefer-host-metadata-property': ['off'],
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
          },
          {
            name: '@ngx-translate/core',
            importNames: ['TranslatePipe'],
            message: 'Use `SiTranslatePipe` from `@siemens/element-translate-ng/translate` instead.'
          },
          {
            name: '@siemens/element-translate-ng',
            message:
              'Always use a dedicated secondary entrypoint, e.g. `@siemens/element-translate-ng/translate`.'
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
        'content': 'Copyright (c) Siemens 2016 - 2026\nSPDX-License-Identifier: MIT'
      }
    ]
  }
});

export const templateConfig = defineConfig({
  extends: [...angularTemplateConfig],
  files: ['**/*.html'],
  rules: {
    '@angular-eslint/template/prefer-ngsrc': ['off'],
    '@angular-eslint/template/no-duplicate-attributes': [
      'error',
      {
        'ignore': ['class']
      }
    ],
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
          'si-tab'
        ]
      }
    ]
  }
});

export default defineConfig(...tsConfig, ...templateConfig);
