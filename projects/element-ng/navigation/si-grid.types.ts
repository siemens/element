/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

/**
 * Wrapping behavior when navigating at grid edges.
 *
 * - `nowrap`: Navigation stops at grid edges (default, safest behavior).
 * - `continuous`: Navigation continues to next/previous row at row edges.
 *   For example, pressing right arrow at the end of a row moves to the start of the next row.
 * - `loop`: Navigation wraps around to the opposite edge.
 *   For example, pressing right arrow at the last cell moves to the first cell.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export type WrapMode = 'continuous' | 'loop' | 'nowrap';

/**
 * Navigation direction for keyboard movement.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Represents a derived row structure in flat layout mode.
 * Used internally when siGridRow directive is not present.
 */
export interface DerivedRow<T = any> {
  /**
   * Cells in this row, sorted by X position (left to right, or right to left in RTL).
   */
  readonly cells: readonly T[];

  /**
   * Y position (top coordinate) used for grouping.
   */
  yPosition: number;

  /**
   * 1-based row index.
   */
  rowIndex: number;
}
