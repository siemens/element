/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, inject, input } from '@angular/core';

import { Cell } from './si-calendar-body.component';
import { CompareAdapter } from './si-compare-adapter';

@Directive({
  selector: '[siCalendarDateCell]',
  host: {
    class: 'si-calendar-date-cell',
    '[attr.aria-disabled]': 'cell().disabled',
    '[class.disabled]': 'cell().disabled',
    '[attr.aria-label]': 'cell().ariaLabel',
    '[class.today]': 'this.cell().isToday',
    '[attr.aria-current]': 'this.cell().isToday ? "date" : null'
  }
})
export class SiCalendarDateCellDirective {
  readonly cell = input.required<Cell>();
  readonly compareAdapter = input.required<CompareAdapter>();
  /** @defaultValue inject(ElementRef) */
  readonly ref = inject(ElementRef);
}
