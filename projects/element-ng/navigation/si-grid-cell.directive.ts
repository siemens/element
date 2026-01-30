/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Directive, ElementRef, inject, input, model, signal } from '@angular/core';

import { NavigableCell } from './si-grid-navigation.service';

/**
 * Directive for individual cells within a grid.
 * Represents a single focusable cell that can contain content or interactive widgets.
 *
 * @example
 * ```html
 * <!-- Simple data cell -->
 * <div siGridCell>Content</div>
 *
 * <!-- Disabled cell -->
 * <div siGridCell [disabled]="true">N/A</div>
 * ```
 */
@Directive({
  selector: '[siGridCell]',
  host: {
    'attr.role': 'gridcell',
    '[attr.tabindex]': 'tabIndex()',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '[attr.aria-colindex]': 'ariaColIndex()',
    '[attr.aria-rowindex]': 'ariaRowIndex()'
  },
  exportAs: 'siGridCell'
})
export class SiGridCellDirective implements NavigableCell {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /**
   * Whether this cell is disabled and cannot be focused.
   * @defaultValue false
   */
  readonly disabled = input(false);

  /**
   * Explicit 1-based row index for this cell.
   * If not provided, it will be calculated automatically based on position in grid.
   */
  readonly ariaRowIndex = model<number | undefined>();

  /**
   * Explicit 1-based column index for this cell.
   * If not provided, it will be calculated automatically based on position in row.
   */
  readonly ariaColIndex = model<number | undefined>();

  /**
   * Dynamic tabindex based on focus state and navigation mode.
   * Set by parent grid directive.
   * @internal
   */
  readonly tabIndex = signal(-1);

  /**
   * Get the bounding rectangle for this cell.
   * Used by navigation service for rectangle-based positioning.
   * @internal
   */
  getBoundingRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  /**
   * Focus this cell programmatically.
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}
