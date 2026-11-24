/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Provider } from '@angular/core';

import { AssetProject, StackblitzConfig } from './stackblitz.model';

/** Injection token to configure the open in Stackblitz button. */
export const SI_STACKBLITZ_CONFIG = new InjectionToken<StackblitzConfig>('SI_STACKBLITZ_CONFIG');

/** Options to generate the `package.json` of the default Angular Stackblitz template. */
export interface AngularTemplateOptions {
  /** Dependencies for the generated `package.json`. */
  dependencies: Record<string, string>;
  /** Dev dependencies for the generated `package.json`. */
  devDependencies: Record<string, string>;
}

const createAngularPackageJson = ({
  dependencies,
  devDependencies
}: AngularTemplateOptions): string =>
  JSON.stringify(
    {
      name: 'element-example',
      version: '0.0.0',
      scripts: {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build',
        watch: 'ng build --watch --configuration development'
      },
      private: true,
      dependencies: Object.fromEntries(
        Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b))
      ),
      devDependencies: Object.fromEntries(
        Object.entries(devDependencies).sort(([a], [b]) => a.localeCompare(b))
      )
    },
    null,
    2
  );

/** Provides the Stackblitz configuration with template projects. */
export const provideStackblitzConfig = (config: StackblitzConfig): Provider => ({
  provide: SI_STACKBLITZ_CONFIG,
  useValue: config
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
 *
 * @param options - Dependencies for the generated `package.json`.
 */
export const angularTemplateProject = (options: AngularTemplateOptions): AssetProject => ({
  name: 'angular',
  assetUrl: 'assets/angular',
  files: [
    'angular.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'src/index.html',
    'src/main.ts',
    'src/app/app.component.ts',
    'src/app/example.component.ts',
    'src/styles.scss'
  ],
  extraFiles: {
    'package.json': createAngularPackageJson(options)
  }
});
