/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from '@siemens/angular-api-docs-extractor';

export default defineConfig({
  packages: [
    'projects/element-ng',
    'projects/charts-ng',
    'projects/dashboards-ng',
    'projects/native-charts-ng',
    'projects/element-translate-ng',
    'projects/maps-ng'
  ],
  project: { skipEntryPoints: ['internal', 'testing', 'test', 'test-helpers', 'schematics'] },
  externalApis: [
    { importPath: '@angular/cdk/a11y', names: ['CdkTrapFocus'] },
    { importPath: '@angular/cdk/menu', names: ['CdkContextMenuTrigger', 'CdkMenuTrigger'] },
    { importPath: '@angular/cdk/overlay', names: ['CdkConnectedOverlay', 'CdkOverlayOrigin'] },
    { importPath: '@siemens/ngx-datatable', names: ['DatatableComponent'] }
  ],
  output: { dir: 'dist/element-docs' },
  defaultValues: { unwrapWrapperFunctionTypes: ['TranslatableString'] },
  links: {
    sourceBase: 'https://github.com/siemens/element/blob/main/',
    documentationUrls: {
      RouterLink: 'https://angular.dev/api/router/RouterLink',
      KeyValueDiffer: 'https://angular.dev/api/core/KeyValueDiffer',
      FormsModule: 'https://angular.dev/api/forms/FormsModule',
      ReactiveFormsModule: 'https://angular.dev/api/forms/ReactiveFormsModule'
    }
  }
});
