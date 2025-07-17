/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { GridStackOptions } from 'gridstack';

/**
 * Configuration object for the si-grid component, including
 * the options of gridstack.
 */
export interface GridConfig {
  /**
   * The configuration options of gridstack.
   */
  gridStackOptions?: GridStackOptions;
}

/**
 * The default gridstack configuration options.
 */
export const DEFAULT_GRIDSTACK_OPTIONS: GridStackOptions = {
  handle: '.draggable-overlay',
  cellHeight: 100,
  columnOpts: { breakpoints: [{ w: BOOTSTRAP_BREAKPOINTS.smMinimum, c: 1 }] },
  column: 12,
  margin: '0',
  placeholderClass: 'si-grid-stack-placeholder'
};
