/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core';

import { Direction, WrapMode } from './si-grid.types';

/**
 * Interface for navigable cell.
 */
export interface NavigableCell {
  getBoundingRect(): DOMRect;
  disabled(): boolean;
}

const ALIGNMENT_THRESHOLD = 0.5; // 50% overlap to consider aligned
const DISTANCE_FACTOR = 2; // Factor to prioritize distance over misalignment
const MISALIGNMENT_PENALTY = 10; // Penalty factor for misalignment

/**
 * Service providing rectangle-based grid navigation logic.
 * This is the core innovation that enables navigation to work with any layout
 * (CSS Grid, Flexbox, tables, etc.) by using element positions rather than DOM structure.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class SiGridNavigationService {
  /**
   * Find the next cell in the specified direction using rectangle-based positioning.
   * This works with CSS Grid, Flexbox, tables, and any other layout system.
   *
   * @param currentCell - The currently focused cell
   * @param direction - Direction to navigate
   * @param allCells - All navigable cells in the grid
   * @param wrapMode - Wrapping behavior at edges
   * @returns Next cell to focus, or null if no valid cell found
   */
  findNextCell(
    currentCell: NavigableCell,
    direction: Direction,
    allCells: NavigableCell[],
    wrapMode: WrapMode
  ): NavigableCell | null {
    const currentRect = currentCell.getBoundingRect();
    const enabledCells = allCells.filter(cell => !cell.disabled());

    // Find candidates in the desired direction
    const candidates = enabledCells.filter(cell => {
      if (cell === currentCell) return false;
      const rect = cell.getBoundingRect();
      return this.isInDirection(currentRect, rect, direction);
    });

    // If no candidates, handle wrapping
    if (candidates.length === 0) {
      return this.handleWrapping(currentCell, direction, enabledCells, wrapMode);
    }

    // Find the closest candidate
    return this.findClosestCell(currentRect, candidates, direction);
  }

  /**
   * Find a cell at a vertical offset (for Page Up/Down navigation).
   *
   * @param currentCell - The currently focused cell
   * @param verticalOffset - Number of rows to move (positive = down, negative = up)
   * @param allCells - All navigable cells in the grid
   * @returns Target cell, or null if not found
   */
  findCellAtOffset(
    currentCell: NavigableCell,
    verticalOffset: number,
    allCells: NavigableCell[]
  ): NavigableCell | null {
    const currentRect = currentCell.getBoundingRect();
    const enabledCells = allCells.filter(cell => !cell.disabled());

    // Group cells by rows based on Y position
    const rows = this.groupCellsByRows(enabledCells);

    // Find current row index
    const currentRowIndex = rows.findIndex(row => row.some(cell => cell === currentCell));

    if (currentRowIndex === -1) {
      return null;
    }
    // Calculate target row index
    const targetRowIndex = currentRowIndex + verticalOffset;

    // Clamp to valid range
    if (targetRowIndex < 0) return rows[0][0];
    if (targetRowIndex >= rows.length) {
      return rows[rows.length - 1][rows[rows.length - 1].length - 1];
    }

    // Find cell in target row closest to current horizontal position
    const targetRow = rows[targetRowIndex];
    return this.findCellClosestToHorizontalPosition(targetRow, currentRect.left);
  }

  /**
   * Check if target rectangle is in the specified direction from current rectangle.
   */
  private isInDirection(current: DOMRect, target: DOMRect, direction: Direction): boolean {
    const threshold = 1; // Allow 1px tolerance for rounding errors

    switch (direction) {
      case 'right':
        return target.left >= current.right - threshold;
      case 'left':
        return target.right <= current.left + threshold;
      case 'down':
        return target.top >= current.bottom - threshold;
      case 'up':
        return target.bottom <= current.top + threshold;
    }
  }

  /**
   * Find the closest cell from candidates based on distance and alignment.
   * Prioritizes alignment (overlap in perpendicular axis) over pure distance.
   */
  private findClosestCell(
    currentRect: DOMRect,
    candidates: NavigableCell[],
    direction: Direction
  ): NavigableCell {
    let closestCell = candidates[0];
    let closestDistance = this.calculateDistance(
      currentRect,
      closestCell.getBoundingRect(),
      direction
    );

    for (let i = 1; i < candidates.length; i++) {
      const cell = candidates[i];
      const distance = this.calculateDistance(currentRect, cell.getBoundingRect(), direction);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestCell = cell;
      }
    }

    return closestCell;
  }

  /**
   * Calculate distance between two rectangles for navigation.
   * Prioritizes alignment (overlap in perpendicular axis) over proximity.
   *
   * For horizontal movement (left/right):
   * - Cells with vertical alignment (Y overlap) are strongly preferred
   * - Distance is primarily horizontal, with penalty for misalignment
   *
   * For vertical movement (up/down):
   * - Cells with horizontal alignment (X overlap) are strongly preferred
   * - Distance is primarily vertical, with penalty for misalignment
   */
  private calculateDistance(from: DOMRect, to: DOMRect, direction: Direction): number {
    if (direction === 'right' || direction === 'left') {
      // Horizontal movement: prioritize vertical alignment
      const verticalOverlap = this.calculateOverlap(from.top, from.bottom, to.top, to.bottom);
      const horizontalDist = Math.abs(
        direction === 'right' ? to.left - from.right : from.left - to.right
      );

      // If well-aligned (>50% overlap), use horizontal distance
      // Otherwise, heavily penalize misalignment
      if (verticalOverlap > ALIGNMENT_THRESHOLD) {
        return horizontalDist;
      } else {
        // Add penalty based on vertical misalignment
        const verticalMisalignment = Math.abs(
          (from.top + from.bottom) / 2 - (to.top + to.bottom) / 2
        );
        return horizontalDist * DISTANCE_FACTOR + verticalMisalignment * MISALIGNMENT_PENALTY;
      }
    } else {
      // Vertical movement: prioritize horizontal alignment
      const horizontalOverlap = this.calculateOverlap(from.left, from.right, to.left, to.right);
      const verticalDist = Math.abs(
        direction === 'down' ? to.top - from.bottom : from.top - to.bottom
      );

      // If well-aligned (>50% overlap), use vertical distance
      // Otherwise, heavily penalize misalignment
      if (horizontalOverlap > ALIGNMENT_THRESHOLD) {
        return verticalDist;
      } else {
        // Add penalty based on horizontal misalignment
        const horizontalMisalignment = Math.abs(
          (from.left + from.right) / 2 - (to.left + to.right) / 2
        );
        return verticalDist * DISTANCE_FACTOR + horizontalMisalignment * MISALIGNMENT_PENALTY;
      }
    }
  }

  /**
   * Calculate overlap ratio between two ranges [start1, end1] and [start2, end2].
   * Returns a value between 0 (no overlap) and 1 (complete overlap).
   */
  private calculateOverlap(start1: number, end1: number, start2: number, end2: number): number {
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    const overlapLength = Math.max(0, overlapEnd - overlapStart);
    const range1Length = end1 - start1;

    return range1Length > 0 ? overlapLength / range1Length : 0;
  }

  /**
   * Handle wrapping behavior at grid edges.
   */
  private handleWrapping(
    currentCell: NavigableCell,
    direction: Direction,
    enabledCells: NavigableCell[],
    wrapMode: WrapMode
  ): NavigableCell | null {
    if (wrapMode === 'nowrap') {
      return null;
    }

    if (wrapMode === 'continuous') {
      // For continuous mode, wrap to next/previous row
      if (direction === 'right' || direction === 'left') {
        // Find cells in next/previous row
        const rows = this.groupCellsByRows(enabledCells);
        const currentRowIndex = rows.findIndex(row => row.includes(currentCell));

        if (currentRowIndex === -1) {
          return null;
        }

        if (direction === 'right') {
          // Move to start of next row
          const nextRowIndex = currentRowIndex + 1;
          if (nextRowIndex < rows.length) {
            return rows[nextRowIndex][0];
          }
        } else {
          // Move to end of previous row
          const prevRowIndex = currentRowIndex - 1;
          if (prevRowIndex >= 0) {
            const prevRow = rows[prevRowIndex];
            return prevRow[prevRow.length - 1];
          }
        }
      } else if (direction === 'down' || direction === 'up') {
        // For vertical continuous, wrap to next/previous column
        const columns = this.groupCellsByColumns(enabledCells);
        const currentColIndex = columns.findIndex(col => col.includes(currentCell));

        if (currentColIndex === -1) {
          return null;
        }

        if (direction === 'down') {
          // Move to start of next column
          const nextColIndex = currentColIndex + 1;
          if (nextColIndex < columns.length) {
            return columns[nextColIndex][0];
          }
        } else {
          // Move to end of previous column
          const prevColIndex = currentColIndex - 1;
          if (prevColIndex >= 0) {
            const prevCol = columns[prevColIndex];
            return prevCol[prevCol.length - 1];
          }
        }
      }
      return null;
    }

    if (wrapMode === 'loop') {
      // For loop mode, wrap to opposite edge of grid
      if (direction === 'right') {
        // Find first cell in current row, or first cell overall
        const rows = this.groupCellsByRows(enabledCells);
        const currentRowIndex = rows.findIndex(row => row.includes(currentCell));
        return currentRowIndex !== -1 ? rows[currentRowIndex][0] : enabledCells[0];
      } else if (direction === 'left') {
        // Find last cell in current row, or last cell overall
        const rows = this.groupCellsByRows(enabledCells);
        const currentRowIndex = rows.findIndex(row => row.includes(currentCell));
        if (currentRowIndex !== -1) {
          const row = rows[currentRowIndex];
          return row[row.length - 1];
        }
        return enabledCells[enabledCells.length - 1];
      } else if (direction === 'down') {
        // Find first cell in current column, or first cell overall
        const columns = this.groupCellsByColumns(enabledCells);
        const currentColIndex = columns.findIndex(col => col.includes(currentCell));
        return currentColIndex !== -1 ? columns[currentColIndex][0] : enabledCells[0];
      } else {
        // up
        // Find last cell in current column, or last cell overall
        const columns = this.groupCellsByColumns(enabledCells);
        const currentColIndex = columns.findIndex(col => col.includes(currentCell));
        if (currentColIndex !== -1) {
          const col = columns[currentColIndex];
          return col[col.length - 1];
        }
        return enabledCells[enabledCells.length - 1];
      }
    }

    return null;
  }

  /**
   * Group cells by rows based on Y position.
   */
  groupCellsByRows(cells: readonly NavigableCell[]): readonly NavigableCell[][] {
    const rowMap = new Map<number, NavigableCell[]>();

    cells.forEach(cell => {
      const rect = cell.getBoundingRect();
      const rowKey = Math.round(rect.top);

      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, []);
      }
      rowMap.get(rowKey)!.push(cell);
    });

    // Sort rows by Y position, sort cells within each row by X position
    return Array.from(rowMap.entries())
      .sort(([y1], [y2]) => y1 - y2)
      .map(([_, rowCells]) =>
        rowCells.sort((a, b) => a.getBoundingRect().left - b.getBoundingRect().left)
      );
  }

  /**
   * Group cells by columns based on X position.
   */
  private groupCellsByColumns(cells: NavigableCell[]): NavigableCell[][] {
    const colMap = new Map<number, NavigableCell[]>();

    cells.forEach(cell => {
      const rect = cell.getBoundingRect();
      const colKey = Math.round(rect.left);

      if (!colMap.has(colKey)) {
        colMap.set(colKey, []);
      }
      colMap.get(colKey)!.push(cell);
    });

    // Sort columns by X position, sort cells within each column by Y position
    return Array.from(colMap.entries())
      .sort(([x1], [x2]) => x1 - x2)
      .map(([_, colCells]) =>
        colCells.sort((a, b) => a.getBoundingRect().top - b.getBoundingRect().top)
      );
  }

  /**
   * Find cell in a row closest to a horizontal position.
   */
  private findCellClosestToHorizontalPosition(
    cells: NavigableCell[],
    targetX: number
  ): NavigableCell {
    let closestCell = cells[0];
    let closestDistance = Math.abs(closestCell.getBoundingRect().left - targetX);

    for (let i = 1; i < cells.length; i++) {
      const cell = cells[i];
      const distance = Math.abs(cell.getBoundingRect().left - targetX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestCell = cell;
      }
    }

    return closestCell;
  }
}
