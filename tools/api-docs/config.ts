/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { config } from '../../.docs-composerrc.mjs';

/** Adapt the shared Composer projects to the source extraction contract. */
export const packages = config.include.map(project => project.packageDir);

export interface ExternalApi {
  /** Public import path of the dependency module. */
  importPath: string;
  /** Exported declaration names. */
  names: string[];
}

/**
 * Dependency APIs documented together with the packages.
 * Nothing else is extracted from dependencies.
 */
export const externalApis: ExternalApi[] = [
  { importPath: '@angular/cdk/a11y', names: ['CdkTrapFocus'] },
  { importPath: '@angular/cdk/menu', names: ['CdkContextMenuTrigger', 'CdkMenuTrigger'] },
  { importPath: '@angular/cdk/overlay', names: ['CdkConnectedOverlay', 'CdkOverlayOrigin'] },
  { importPath: '@siemens/ngx-datatable', names: ['DatatableComponent'] }
];

import { defineConfig } from './configuration.js';

export default defineConfig({
  root: '../..',
  packages,
  project: { skipEntryPoints: ['internal', 'testing', 'test', 'test-helpers', 'schematics'] },
  externalApis,
  output: { dir: 'dist/element-docs' },
  defaultValues: { unwrapWrapperFunctionTypes: ['TranslatableString'] },
  links: {
    sourceBase: 'https://github.com/siemens/element/blob/main/',
    documentationUrls: {
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
      Storage: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage',
      sessionStorage: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage',
      RouterLink: 'https://angular.dev/api/router/RouterLink',
      KeyValueDiffer: 'https://angular.dev/api/core/KeyValueDiffer',
      FormsModule: 'https://angular.dev/api/forms/FormsModule',
      ReactiveFormsModule: 'https://angular.dev/api/forms/ReactiveFormsModule',
      '@angular/router#RouterLink': 'https://angular.dev/api/router/RouterLink',
      '@angular/core#KeyValueDiffer': 'https://angular.dev/api/core/KeyValueDiffer',
      '@angular/forms#FormsModule': 'https://angular.dev/api/forms/FormsModule',
      '@angular/forms#ReactiveFormsModule': 'https://angular.dev/api/forms/ReactiveFormsModule'
    }
  }
});
