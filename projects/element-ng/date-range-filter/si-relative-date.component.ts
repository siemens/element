/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import {
  SelectOption,
  SiSelectComponent,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

import { ONE_DAY, ONE_MINUTE } from './si-date-range-filter.types';

interface OffsetOption extends SelectOption<string> {
  offset: number;
}

@Component({
  selector: 'si-relative-date',
  templateUrl: './si-relative-date.component.html',
  styleUrl: './si-relative-date.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    SiNumberInputComponent,
    SiSelectComponent,
    SiSelectSingleValueDirective,
    SiSelectSimpleOptionsDirective
  ]
})
export class SiRelativeDateComponent implements OnChanges {
  /** @defaultValue 0 */
  readonly value = input(0);
  /** @defaultValue false */
  readonly enableTimeSelection = input(false, { transform: booleanAttribute });
  readonly valueLabel = input.required<string>();
  readonly unitLabel = input.required<string>();
  readonly valueChange = output<number>();

  protected readonly internalValue = signal(0);
  protected readonly offset = signal(0);
  protected readonly unit = signal('days');
  private readonly fullOffsetList: OffsetOption[] = [
    {
      type: 'option',
      value: 'minutes',
      label: $localize`:@@SI_DATE_RANGE_FILTER.MINUTES:Minutes`,
      offset: ONE_MINUTE
    },
    {
      type: 'option',
      value: 'hours',
      label: $localize`:@@SI_DATE_RANGE_FILTER.HOURS:Hours`,
      offset: 60 * ONE_MINUTE
    },
    {
      type: 'option',
      value: 'days',
      label: $localize`:@@SI_DATE_RANGE_FILTER.DAYS:Days`,
      offset: ONE_DAY
    },
    {
      type: 'option',
      value: 'weeks',
      label: $localize`:@@SI_DATE_RANGE_FILTER.WEEKS:Weeks`,
      offset: 7 * ONE_DAY
    },
    {
      type: 'option',
      value: 'months',
      label: $localize`:@@SI_DATE_RANGE_FILTER.MONTHS:Months`,
      offset: 30 * ONE_DAY
    },
    {
      type: 'option',
      value: 'years',
      label: $localize`:@@SI_DATE_RANGE_FILTER.YEARS:Years`,
      offset: 365 * ONE_DAY
    }
  ];

  protected readonly offsetList = computed(() =>
    this.enableTimeSelection()
      ? this.fullOffsetList
      : this.fullOffsetList.filter(item => item.offset >= ONE_DAY)
  );

  ngOnChanges(changes: SimpleChanges): void {
    const value = this.value();
    if (changes.value && value !== this.internalValue()) {
      this.internalValue.set(value);
      this.calculateOffset();
    }
  }

  private calculateOffset(): void {
    const offsetList = this.offsetList();
    let unit = '';
    if (offsetList.length) {
      this.offset.set(0);
      unit = offsetList[0].value;
    }

    for (let i = offsetList.length - 1; i >= 0; i--) {
      const item = offsetList[i];
      const raw = this.internalValue() / item.offset;
      const rounded = Math.round(raw);
      if (rounded > 0 && Math.abs(raw - rounded) < 0.001) {
        this.offset.set(rounded);
        unit = item.value;
        break;
      }
    }

    this.changeUnit(unit);
  }

  protected updateValue(offset: number): void {
    this.offset.set(offset);
    const item = this.offsetList().find(x => x.value === this.unit())!;
    this.internalValue.set(offset * item.offset);
    this.valueChange.emit(this.internalValue());
  }

  protected changeUnit(newUnit: string): void {
    this.unit.set(newUnit);
    const item = this.offsetList().find(x => x.value === this.unit())!;
    this.offset.set(Math.max(1, Math.round(this.internalValue() / item.offset)));
    this.internalValue.set(this.offset() * item.offset);
    this.valueChange.emit(this.internalValue());
  }
}
