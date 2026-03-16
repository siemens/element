/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import {
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';

import { SiGridCellDirective } from './si-grid-cell.directive';
import { SiGridNavigationService } from './si-grid-navigation.service';
import { DerivedRow, WrapMode } from './si-grid.types';

/**
 * Grid directive providing keyboard navigation.
 *
 * @example
 * ```html
 * <!-- Flat layout (CSS Grid) -->
 * <div siGrid style="display: grid; grid-template-columns: repeat(3, 1fr);">
 *   <div siGridCell>Cell 1</div>
 *   <div siGridCell>Cell 2</div>
 *   <div siGridCell>Cell 3</div>
 * </div>
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@Directive({
  selector: '[siGrid]',
  host: {
    'attr.role': 'grid',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(keydown)': 'onKeydown($event)',
    '(focus)': 'onFocus($event)'
  },
  exportAs: 'siGrid'
})
export class SiGridDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly navigationService = inject(SiGridNavigationService);

  /**
   * Horizontal wrapping behavior at row edges.
   * @defaultValue 'nowrap'
   */
  readonly colWrap = input<WrapMode>('nowrap');

  /**
   * Vertical wrapping behavior at column edges.
   * @defaultValue 'nowrap'
   */
  readonly rowWrap = input<WrapMode>('nowrap');

  /**
   * Whether the entire grid is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false);

  /**
   * Number of rows to jump for Page Up/Down navigation.
   * @defaultValue 5
   */
  readonly pageSize = input(5);

  /**
   * Currently focused cell.
   */
  private readonly focusedCell = signal<SiGridCellDirective | null>(null);

  /** Query for direct cell children (flat pattern without siGridRow). */
  private readonly allCells = contentChildren(SiGridCellDirective, { descendants: true });

  /** Get only enabled (non-disabled) cells. */
  private readonly enabledCells = computed(() => {
    const a = this.allCells();
    return a.filter(cell => !cell.disabled());
  });

  /**
   * Derive row structure from rectangle positions for flat layouts.
   * Groups cells by Y position and sorts within rows by X position.
   */
  private readonly derivedRows = computed<DerivedRow<SiGridCellDirective>[]>(() => {
    const rows = this.navigationService.groupCellsByRows(this.allCells());
    return rows.map((rowCells, index) => ({
      cells: rowCells as unknown as readonly SiGridCellDirective[],
      yPosition: rowCells[0]?.getBoundingRect().top ?? 0,
      rowIndex: index + 1
    }));
  });

  constructor() {
    // Update tabindex using roving tabindex pattern where only one cell is in tab sequence.
    effect(() => {
      const focused = this.focusedCell();
      for (const cell of this.allCells()) {
        if (cell.disabled()) {
          cell.tabIndex.set(-1);
        } else if (cell === focused) {
          cell.tabIndex.set(0);
        } else {
          cell.tabIndex.set(-1);
        }
      }
    });

    // Set initial focus to first enabled cell
    effect(() => {
      const enabled = this.enabledCells();
      if (enabled.length > 0 && this.focusedCell() === null) {
        this.focusedCell.set(enabled[0]);
      }
    });

    effect(() => {
      this.allCells().forEach(cell => cell.focusChange.subscribe(() => this.focusedCell.set(cell)));
    });
  }

  /**
   * Handle keyboard navigation.
   * @internal
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    const currentCell = this.focusedCell();
    if (!currentCell) {
      return;
    }

    const key = event.key;
    let handled = false;

    // Navigation keys
    if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp') {
      handled = this.handleArrowKey(key, currentCell);
    } else if (key === 'Home') {
      handled = this.handleHome(event.ctrlKey, currentCell);
    } else if (key === 'End') {
      handled = this.handleEnd(event.ctrlKey, currentCell);
    } else if (key === 'PageDown') {
      handled = this.handlePageDown(currentCell);
    } else if (key === 'PageUp') {
      handled = this.handlePageUp(currentCell);
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle arrow key navigation.
   */
  private handleArrowKey(key: string, currentCell: SiGridCellDirective): boolean {
    const direction = this.getDirection(key);
    if (!direction) {
      return false;
    }

    const wrapMode =
      direction === 'left' || direction === 'right' ? this.colWrap() : this.rowWrap();

    const nextCell = this.navigationService.findNextCell(
      currentCell,
      direction,
      this.enabledCells(),
      wrapMode
    );

    if (nextCell && nextCell instanceof SiGridCellDirective) {
      this.focusCell(nextCell);
      return true;
    }

    return false;
  }

  /**
   * Handle Home key (move to first cell in row or grid).
   */
  private handleHome(ctrlKey: boolean, currentCell: SiGridCellDirective): boolean {
    if (ctrlKey) {
      // Ctrl+Home: go to first cell in grid
      const firstCell = this.enabledCells()[0];
      if (firstCell) {
        this.focusCell(firstCell);
        return true;
      }
    } else {
      // Home: go to first cell in current row
      const rows = this.derivedRows();
      const currentRow = rows.find(row => row.cells.includes(currentCell));
      if (currentRow) {
        const firstEnabledCell = currentRow.cells.find(cell => !cell.disabled());
        if (firstEnabledCell) {
          this.focusCell(firstEnabledCell);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Handle End key (move to last cell in row or grid).
   */
  private handleEnd(ctrlKey: boolean, currentCell: SiGridCellDirective): boolean {
    if (ctrlKey) {
      // Ctrl+End: go to last cell in grid
      const enabled = this.enabledCells();
      const lastCell = enabled[enabled.length - 1];
      if (lastCell) {
        this.focusCell(lastCell);
        return true;
      }
    } else {
      // End: go to last cell in current row
      const rows = this.derivedRows();
      const currentRow = rows.find(row => row.cells.includes(currentCell));
      if (currentRow) {
        const enabledCells = currentRow.cells.filter(cell => !cell.disabled());
        const lastEnabledCell = enabledCells[enabledCells.length - 1];
        if (lastEnabledCell) {
          this.focusCell(lastEnabledCell);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Handle Page Down key.
   */
  private handlePageDown(currentCell: SiGridCellDirective): boolean {
    const targetCell = this.navigationService.findCellAtOffset(
      currentCell,
      this.pageSize(),
      this.enabledCells()
    );

    if (targetCell && targetCell instanceof SiGridCellDirective) {
      this.focusCell(targetCell);
      return true;
    }

    return false;
  }

  /**
   * Handle Page Up key.
   */
  private handlePageUp(currentCell: SiGridCellDirective): boolean {
    const targetCell = this.navigationService.findCellAtOffset(
      currentCell,
      -this.pageSize(),
      this.enabledCells()
    );

    if (targetCell && targetCell instanceof SiGridCellDirective) {
      this.focusCell(targetCell);
      return true;
    }

    return false;
  }

  /**
   * Convert key name to direction, handling RTL.
   */
  private getDirection(key: string): 'up' | 'down' | 'left' | 'right' | null {
    const isRtl = isRTL();
    switch (key) {
      case 'ArrowUp':
        return 'up';
      case 'ArrowDown':
        return 'down';
      case 'ArrowLeft':
        return isRtl ? 'right' : 'left';
      case 'ArrowRight':
        return isRtl ? 'left' : 'right';
      default:
        return null;
    }
  }

  /**
   * Handle focus event on grid.
   * @internal
   */
  protected onFocus(event: FocusEvent): void {
    // If grid itself receives focus and no cell is focused, focus first enabled cell
    if (event.target === this.elementRef.nativeElement) {
      const focused = this.focusedCell();
      if (!focused) {
        const firstEnabled = this.enabledCells()[0];
        if (firstEnabled) {
          this.focusCell(firstEnabled);
        }
      } else {
        focused.focus();
      }
    }
  }

  /**
   * Programmatically focus a cell.
   */
  focusCell(cell: SiGridCellDirective): void {
    if (cell.disabled()) return;

    this.focusedCell.set(cell);
    cell.focus();
  }
}
