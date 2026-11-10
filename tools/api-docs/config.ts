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
