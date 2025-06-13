/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  input,
  model,
  output,
  viewChildren
} from '@angular/core';

import { SiCalendarDateCellDirective } from './si-calendar-date-cell.directive';
import { CompareAdapter, DayCompareAdapter } from './si-compare-adapter';

/** CSS classes that can be associated with a calendar cell. */
export type CellCssClasses = string | string[] | Set<string> | { [key: string]: any };

export interface Cell {
  value: number;
  /** Indicate that the cell is disabled */
  disabled: boolean;
  /** Cell specific aria label */
  ariaLabel: string;
  /** Display value */
  displayValue: string;
  /**
   * Indicate that the cell is a preview, this is dedicated to the calendar month
   * view to where a day could be part of the previous or next month
   */
  isPreview: boolean;
  /**
   * The cell corresponds to today.
   */
  isToday: boolean;
  /** Raw value */
  valueRaw: Date;
  /** Additional CSS classes for the cell */
  cssClasses: CellCssClasses;
}

/**
 * Base interface for selections.
 */
abstract class SelectionStrategy {
  constructor(protected compare: CompareAdapter) {}

  /**
   * Indicate whether the cell is selected
   */
  abstract isSelected(cell: Cell, start?: Date, end?: Date): boolean;
  /**
   * Cell is between start and end value.
   * start \< Cell value \< end
   */
  abstract inRange(c: Cell, start?: Date, end?: Date): boolean;
  /**
   * Cell is either startValue or endValue
   */
  abstract isRangeSelected(cell: Cell, date?: Date): boolean;
  /**
   * Preview selection range on mouse hover.
   */
  abstract previewRangeHover(cell: Cell, hoverCell?: Cell, start?: Date): boolean;
  /**
   * Preview selection range on mouse hover end of range.
   */
  abstract previewRangeHoverEnd(cell: Cell, hoverCell?: Cell, start?: Date): boolean;
}

/**
 * Strategy the handle single selection within the {@link SiCalendarBodyComponent}.
 */
class SingleSelectionStrategy extends SelectionStrategy {
  isSelected(cell: Cell, start?: Date, end?: Date): boolean {
    return this.compare.isEqual(cell.valueRaw, start);
  }

  inRange(cell: Cell, start?: Date, end?: Date): boolean {
    return false;
  }

  isRangeSelected(cell: Cell, date?: Date): boolean {
    return false;
  }

  previewRangeHover(cell: Cell, hoverCell?: Cell, start?: Date): boolean {
    return false;
  }

  previewRangeHoverEnd(cell: Cell, hoverCell?: Cell, start?: Date): boolean {
    return false;
  }
}

/**
 * Strategy the handle range selection within the {@link SiCalendarBodyComponent}.
 */
class RangeSelectionStrategy extends SelectionStrategy {
  isSelected(cell: Cell, start?: Date, end?: Date): boolean {
    return this.compare.isEqual(cell.valueRaw, start) || this.compare.isEqual(cell.valueRaw, end);
  }

  inRange(c: Cell, start?: Date, end?: Date): boolean {
    if (!start || !end) {
      return false;
    }
    return this.compare.isBetween(c.valueRaw, start, end);
  }

  isRangeSelected(cell: Cell, date?: Date): boolean {
    return this.compare.isEqual(cell.valueRaw, date);
  }

  previewRangeHover(cell: Cell, hoverCell?: Cell, start?: Date): boolean {
    if (!hoverCell || cell.disabled || !start) {
      return false;
    }
    return (
      this.compare.isAfter(cell.valueRaw, start) &&
      this.compare.isEqualOrBefore(cell.valueRaw, hoverCell.valueRaw)
    );
  }

  previewRangeHoverEnd(cell: Cell, hoverCell?: Cell, start?: Date): boolean {
    if (!hoverCell || cell.disabled || !start) {
      return false;
    }
    return (
      this.compare.isAfter(cell.valueRaw, start) &&
      this.compare.isEqual(cell.valueRaw, hoverCell.valueRaw)
    );
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[si-calendar-body]',
  templateUrl: './si-calendar-body.component.html',
  exportAs: 'siCalendarBody',
  imports: [NgClass, A11yModule, SiCalendarDateCellDirective],
  host: {
    class: 'si-calendar-body'
  }
})
export class SiCalendarBodyComponent {
  /** The active date, the cell which will receive the focus. */
  readonly focusedDate = model.required<Date>();
  /** The date which shall be indicated as currently selected. */
  readonly startDate = input<Date>();
  /** Selected end value which is only considered with enableRangeSelection. */
  readonly endDate = input<Date>();
  /**
   * The cells to display in the table.
   *
   * @defaultValue []
   */
  readonly rows = input<Cell[][]>([]);
  /**
   * Labels for each row, which can be used to display the week number.
   * @defaultValue undefined
   */
  readonly rowLabels = input<string[] | undefined>(undefined);
  /**
   * Additional row label CSS class(es).
   *
   * @defaultValue []
   */
  readonly rowLabelCssClasses = input<CellCssClasses>([]);
  /**
   * Choose the selection strategy between single or range selection.
   * @defaultValue false
   */
  readonly enableRangeSelection = input(false);
  /**
   * Indicate whether a range preview shall be displayed.
   * It's necessary since to display a preview also datepicker has a valid endDate.
   *
   * @defaultValue true
   */
  readonly previewRange = input(true, { transform: booleanAttribute });
  /** The cell which which has the mouse hover. */
  readonly activeHover = model<Cell>();
  /**
   * Compare date functions which are necessary to compare a the dates according the current view.
   *
   * @defaultValue new DayCompareAdapter()
   */
  readonly compareAdapter = input<CompareAdapter>(new DayCompareAdapter());
  /** Emits when a user select a cell via click, space or enter. */
  readonly selectedValueChange = output<Date>();

  private readonly calendarDateCells = viewChildren(SiCalendarDateCellDirective);

  protected readonly selection = computed(() =>
    this.enableRangeSelection()
      ? new RangeSelectionStrategy(this.compareAdapter())
      : new SingleSelectionStrategy(this.compareAdapter())
  );

  /**
   * Focus calendar cell which is marked as active cell.
   */
  focusActiveCell(): void {
    setTimeout(() => {
      const focusedDateCells = this.calendarDateCells().filter(dateCell =>
        this.compareAdapter().isEqual(this.focusedDate()!, dateCell.cell().valueRaw)
      );
      if (focusedDateCells.length > 0) {
        focusedDateCells[0].ref.nativeElement.focus();
      }
    });
  }

  protected isActive(cell: Cell): boolean {
    return this.compareAdapter().isEqual(this.focusedDate()!, cell.valueRaw);
  }

  protected cellCss(cell: Cell): CellCssClasses {
    return cell.cssClasses;
  }

  protected emitActiveHover(cell: Cell): void {
    this.activeHover.set(cell);
  }

  protected emitSelectCell(selection: Cell): void {
    if (selection.disabled) {
      return;
    }
    this.selectedValueChange.emit(selection.valueRaw);
  }

  protected emitActiveDateChange(cell: Cell): void {
    if (!cell.disabled && !cell.isPreview) {
      // To provide a date-range preview it is necessary to maintain hoverCell also in case of keyboard usage
      this.emitActiveHover(cell);
      this.focusedDate.set(cell.valueRaw);
    }
  }
}
