/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Provider } from '@angular/core';

import { AssetProject, StackblitzConfig } from './stackblitz.model';

/** Injection token to configure the open in Stackblitz button. */
export const SI_STACKBLITZ_CONFIG = new InjectionToken<StackblitzConfig>('SI_STACKBLITZ_CONFIG');

/** Provides the Stackblitz configuration with default template projects. */
export const provideStackblitzConfig = (config?: StackblitzConfig): Provider => ({
  provide: SI_STACKBLITZ_CONFIG,
  useFactory: () => {
    return { templates: [angularTemplateProject()], ...config };
  }
});

/**
 * Create default Angular template project config.
 * The files are loaded from the assets folder, consumers need to add the following asset configuration
 * to their angular.json file:
 *
 * ```json
 *   "assets": [
 *   ...
 *   {
 *     "glob": "**\/*",
 *     "input": "projects/live-preview/assets/",
 *     "output": "/assets/"
 *   }]
 * ```
 */
export const angularTemplateProject = (): AssetProject => ({
  name: 'angular',
  assetUrl: 'assets/angular',
  files: [
    'angular.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'src/index.html',
    'src/main.ts',
    'src/app/app.component.ts',
    'src/app/example.component.ts',
    'src/styles.scss'
  ]
});
