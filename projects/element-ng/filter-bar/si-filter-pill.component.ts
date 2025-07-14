/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { Filter } from './filter';

@Component({
  selector: 'si-filter-pill',
  imports: [NgClass, NgTemplateOutlet, SiTranslatePipe],
  templateUrl: './si-filter-pill.component.html',
  styleUrl: './si-filter-pill.component.scss'
})
export class SiFilterPillComponent {
  /**
   * Settings of the filter pill.
   */
  readonly filter = input.required<Filter>();

  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @defaultValue 0 */
  readonly totalPills = input(0);

  /**
   * Output callback event which will provide you the name of the deleted filter
   * pill if a filter was deleted.
   */
  readonly deleteFilters = output<Filter>();

  protected deleteClicked(): void {
    this.deleteFilters.emit(this.filter());
  }
}
