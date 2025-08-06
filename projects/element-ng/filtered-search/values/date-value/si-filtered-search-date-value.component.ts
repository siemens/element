/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  LOCALE_ID,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  getDatepickerFormat,
  getNamedFormat,
  isValid,
  SiDatepickerDirective,
  SiDatepickerOverlayDirective
} from '@spike-rabbit/element-ng/datepicker';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { getISODateString } from '../../si-filtered-search-helper';
import { SiFilteredSearchValueBase } from '../si-filtered-search-value.base';

@Component({
  selector: 'si-filtered-search-date-value',
  imports: [DatePipe, FormsModule, SiDatepickerDirective, SiTranslatePipe],
  templateUrl: './si-filtered-search-date-value.component.html',
  styleUrl: './si-filtered-search-date-value.component.scss',
  providers: [
    { provide: SiFilteredSearchValueBase, useExisting: SiFilteredSearchDateValueComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchDateValueComponent extends SiFilteredSearchValueBase {
  private locale = inject(LOCALE_ID).toString();

  protected override readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');
  private readonly datepickerOverlay = viewChild(SiDatepickerOverlayDirective);

  protected readonly disableTime = signal(false);
  protected readonly shortDateFormat: string;

  override readonly focusInOverlay = computed(() => !!this.datepickerOverlay()?.isShown());
  readonly validFormat = computed(() => isValid(this.criterionValue().dateValue));
  // The information if the time is currently disabled is only present in the
  // current search criterion instance and not in the generic configuration.
  // So we need to merge the initial config with the current instance config.
  readonly dateConfig = computed(() => ({
    ...this.definition().datepickerConfig,
    disabledTime: this.disableTime()
  }));
  readonly dateFormat = computed(() => getDatepickerFormat(this.locale, this.dateConfig()));
  override readonly validValue = computed(() => {
    const dateConfig = this.dateConfig();
    const minDate = dateConfig?.minDate ?? false;
    const maxDate = dateConfig?.maxDate ?? false;
    const dateValue = this.criterionValue().dateValue ?? false;
    return (
      (!minDate || (minDate && dateValue && dateValue >= minDate)) &&
      (!maxDate || (maxDate && dateValue && dateValue <= maxDate))
    );
  });

  constructor() {
    super();
    this.shortDateFormat = getNamedFormat(this.locale, 'shortDate');
    if (!this.shortDateFormat.includes('yyyy')) {
      this.shortDateFormat = this.shortDateFormat.replace('yy', 'yyyy');
    }
  }

  protected valueDateSelect(date: Date): void {
    // In case the user type an illegal date into the date input,
    // our directive emits a new undefined value and keeps
    if (!date && this.criterionValue().dateValue) {
      date = new Date(this.criterionValue().dateValue!);
    }

    let value: string;
    const validationType = this.definition().validationType;
    if (validationType === 'date') {
      value = getISODateString(date, 'date', this.locale);
    } else if (validationType === 'date-time') {
      if (this.disableTime()) {
        value = getISODateString(date, 'date', this.locale);
      } else {
        value = getISODateString(date, 'date-time', this.locale);
      }
    }

    this.criterionValue.update(v => ({ ...v, value, dateValue: date }));
  }
}
