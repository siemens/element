/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { Filter } from './filter';

@Component({
  selector: 'si-filter-pill',
  imports: [NgTemplateOutlet, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-filter-pill.component.html',
  styleUrl: './si-filter-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiFilterPillComponent {
  protected readonly icons = addIcons({ elementCancel });
  /**
   * Settings of the filter pill.
   */
  readonly filter = input.required<Filter>();

  /**
   * Whether the pill's delete button is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Total number of filter pills currently displayed.
   *
   * @defaultValue 0
   */
  readonly totalPills = input(0);

  /**
   * Emits the filter when its delete button is clicked.
   */
  readonly deleteFilters = output<Filter>();

  protected deleteClicked(): void {
    this.deleteFilters.emit(this.filter());
  }
}
