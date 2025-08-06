/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { MediaMatcher } from '@angular/cdk/layout';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  OnChanges,
  output,
  Pipe,
  PipeTransform,
  signal,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DatepickerConfig,
  DatepickerInputConfig,
  DateRange,
  isValid,
  SiCalendarButtonComponent,
  SiDatepickerComponent,
  SiDatepickerDirective
} from '@siemens/element-ng/datepicker';
import { addIcons, elementDown2, SiIconNextComponent } from '@siemens/element-ng/icon';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiDateRangeCalculationService } from './si-date-range-calculation.service';
import {
  DateRangeFilter,
  DateRangePreset,
  ONE_DAY,
  ResolvedDateRange
} from './si-date-range-filter.types';
import { SiRelativeDateComponent } from './si-relative-date.component';

@Pipe({ name: 'presetMatchFilter', pure: true })
export class PresetMatchFilterPipe implements PipeTransform {
  transform(value: string, term: string): boolean {
    return !term ? true : value.toLowerCase().includes(term.toLowerCase());
  }
}

@Component({
  selector: 'si-date-range-filter',
  imports: [
    CdkOption,
    CdkListbox,
    CdkTrapFocus,
    DatePipe,
    FormsModule,
    NgTemplateOutlet,
    OverlayModule,
    PresetMatchFilterPipe,
    SiCalendarButtonComponent,
    SiDatepickerComponent,
    SiDatepickerDirective,
    SiIconNextComponent,
    SiRelativeDateComponent,
    SiSearchBarComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-date-range-filter.component.html',
  styleUrl: './si-date-range-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mobile]': 'smallScreen'
  }
})
export class SiDateRangeFilterComponent implements OnChanges {
  private readonly service = inject(SiDateRangeCalculationService);
  private readonly mediaMatcher = inject(MediaMatcher);
  protected readonly smallScreen = this.mediaMatcher.matchMedia(
    `(max-width: ${BOOTSTRAP_BREAKPOINTS.mdMinimum}px)`
  ).matches;

  /** The filter range object */
  readonly range = model.required<DateRangeFilter>();
  /** List of preset time ranges. When not present or empty, the preset section won't show */
  readonly presetList = input<DateRangePreset[]>();
  /**
   * Determines if there's a search field for the preset list
   *
   * @defaultValue true
   */
  readonly presetSearch = input(true, { transform: booleanAttribute });
  /**
   * Determines if time is selectable or only dates
   *
   * @defaultValue false
   */
  readonly enableTimeSelection = input(false, { transform: booleanAttribute });
  /**
   * Determines whether to show input fields or a date-range calendar in basic mode.
   * When time selection is enabled, this has no effect and input fields are always shown.
   *
   * @defaultValue 'calendar'
   */
  readonly basicMode = input<'input' | 'calendar'>('calendar');
  /**
   * Reverses the order of the from/to fields
   *
   * @defaultValue false
   */
  readonly reverseInputFields = input(false, { transform: booleanAttribute });

  /**
   * Determines whether to show the 'Apply' button
   *
   * @defaultValue false
   */
  readonly showApplyButton = input(false, { transform: booleanAttribute });
  /**
   * Hides the advanced mode if input allows
   *
   * @defaultValue false
   */
  readonly hideAdvancedMode = input(false, { transform: booleanAttribute });

  /**
   * label for the "Reference point" title
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.REF_POINT:Reference point`)
   * ```
   */
  readonly refLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.REF_POINT:Reference point`));
  /**
   * label for the "Reference point" title
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.FROM:From`)
   * ```
   */
  readonly fromLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.FROM:From`));
  /**
   * label for the "Reference point" title
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.TO:To`)
   * ```
   */
  readonly toLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.TO:To`));
  /**
   * label for the "Range" title
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.RANGE:Range`)
   * ```
   */
  readonly rangeLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.RANGE:Range`));
  /**
   * label for the "Today" checkbox
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.TODAY:Today`)
   * ```
   */
  readonly todayLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.TODAY:Today`));
  /**
   * label for the "Now" checkbox
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.NOW:Now`)
   * ```
   */
  readonly nowLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.NOW:Now`));
  /**
   * label for "Date" field / radio button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.DATE:Date`)
   * ```
   */
  readonly dateLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.DATE:Date`));
  /**
   * label for the "Preview" title
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.PREVIEW:Preview`)
   * ```
   */
  readonly previewLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.PREVIEW:Preview`));
  /**
   * Placeholder for date fields
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.DATE_PLACEHOLDER:Select date`)
   * ```
   */
  readonly datePlaceholder = input(
    t(() => $localize`:@@SI_DATE_RANGE_FILTER.DATE_PLACEHOLDER:Select date`)
  );
  /**
   * label for the "Before" toggle
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.BEFORE:Before`)
   * ```
   */
  readonly beforeLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.BEFORE:Before`));
  /**
   * label for the "After" toggle
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.AFTER:After`)
   * ```
   */
  readonly afterLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.AFTER:After`));
  /**
   * label for the "Within" toggle
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.WITHIN:Within`)
   * ```
   */
  readonly withinLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.WITHIN:Within`));
  /**
   * label for the "value" number input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.VALUE:Value`)
   * ```
   */
  readonly valueLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.VALUE:Value`));
  /**
   * label for the "Unit" select
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.UNIT:Unit`)
   * ```
   */
  readonly unitLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.UNIT:Unit`));
  /**
   * label for the "search" input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.SEARCH:Search`)
   * ```
   */
  readonly searchLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.SEARCH:Search`));
  /**
   * label for the "search" input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.PRESETS:Presets`)
   * ```
   */
  readonly presetLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.PRESETS:Presets`));
  /**
   * label for the "advanced" switch
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.ADVANCED:Advanced`)
   * ```
   */
  readonly advancedLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.ADVANCED:Advanced`));
  /**
   * label for the "apply" switch
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATE_RANGE_FILTER.APPLY:Apply`)
   * ```
   */
  readonly applyLabel = input(t(() => $localize`:@@SI_DATE_RANGE_FILTER.APPLY:Apply`));

  /** Event fired when the apply button has been clicked */
  readonly applyClicked = output<void>();

  /** Base configuration on how the dates should be displayed, parts of it may be overwritten internally. */
  readonly datepickerConfig = input<DatepickerInputConfig>();

  protected readonly icons = addIcons({ elementDown2 });
  protected advancedMode = false;
  protected dateRange: DateRange = { start: undefined, end: undefined };

  protected point1Now = true;
  protected point2Mode: 'duration' | 'date' = 'duration';

  protected point1date = this.getDateNow();
  protected point2date = this.getDateNow();
  protected point2offset = 0;
  protected point2range: 'before' | 'after' | 'within' = 'before';
  protected readonly calculatedRange = computed<ResolvedDateRange>(() =>
    this.resolve(this.range())
  );
  protected readonly pipeFormat = computed<string>(() =>
    this.enableTimeSelection()
      ? (this.datepickerConfig()?.dateTimeFormat ?? 'short')
      : (this.datepickerConfig()?.dateFormat ?? 'shortDate')
  );

  protected readonly datepickerConfigInternal = computed<DatepickerConfig>(() => ({
    ...(this.datepickerConfig() ?? {}),
    enableDateRange: false,
    showTime: this.enableTimeSelection(),
    mandatoryTime: this.enableTimeSelection()
  }));

  protected readonly dateRangeConfig = computed<DatepickerConfig>(() => ({
    ...(this.datepickerConfig() ?? {}),
    enableDateRange: true
  }));

  protected readonly filteredPresetList = computed<DateRangePreset[]>(() => {
    const timeFilter = (item: DateRangePreset): boolean => {
      const timeOnly = item.type === 'custom' ? item.timeOnly : item.offset < ONE_DAY;
      return this.enableTimeSelection() || !timeOnly;
    };
    return (this.presetList() ?? []).filter(timeFilter);
  });

  protected readonly focusedDate = computed(() => {
    const date = this.dateRange.end ?? this.dateRange.start;
    return isValid(date) ? date : undefined;
  });
  protected readonly presetFilter = signal('');
  protected readonly presetOpen = signal(false);
  protected readonly inputMode = computed(
    () => this.basicMode() === 'input' || this.enableTimeSelection()
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.enableTimeSelection ||
      changes.datepickerConfig ||
      (changes.range && this.rangeChanged(changes.range.previousValue, changes.range.currentValue))
    ) {
      this.updateFromRange();
    }
    if (
      (changes.basicMode || changes.enableTimeSelection) &&
      this.inputMode() &&
      !this.advancedMode
    ) {
      this.point2Mode = 'date';
      this.point2Changed();
    }
  }

  private getDateNow(): Date {
    const now = new Date();
    if (!this.enableTimeSelection()) {
      this.service.removeTime(now);
    }
    return now;
  }

  private rangeChanged(oldRange: DateRangeFilter | undefined, newRange: DateRangeFilter): boolean {
    return (
      !oldRange ||
      oldRange.point1 !== newRange.point1 ||
      oldRange.point2 !== newRange.point2 ||
      oldRange.range !== newRange.range
    );
  }

  private updateFromRange(): void {
    const rangeVal = this.range();
    this.point1Now = rangeVal.point1 === 'now';
    this.point1date = rangeVal.point1 === 'now' ? this.getDateNow() : rangeVal.point1;
    if (rangeVal.point2) {
      this.point2Mode = rangeVal.point2 instanceof Date ? 'date' : 'duration';
      this.point2date = rangeVal.point2 instanceof Date ? rangeVal.point2 : this.getDateNow();
      this.point2range = rangeVal.range ?? 'before';
      this.point2offset =
        rangeVal.point2 instanceof Date
          ? Math.round(this.point1date.getTime() - rangeVal.point2.getTime())
          : rangeVal.point2;
    }
    if ((this.point1Now && this.basicMode() !== 'input') || this.point2Mode !== 'date') {
      this.advancedMode = true;
    } else {
      this.advancedMode = false;
      this.updateDateRange();
    }
  }

  private resolve(range: DateRangeFilter, skipNormalization?: boolean): ResolvedDateRange {
    return this.service.resolveDateRangeFilter(range, {
      withTime: this.enableTimeSelection(),
      skipNormalization
    });
  }

  protected updateDateRange(range = this.range()): void {
    const calculatedRange = this.resolve(range);
    this.dateRange.start = calculatedRange.start;
    this.dateRange.end = calculatedRange.end;
  }

  protected updateOnModeChange(): void {
    if (this.advancedMode) {
      const calculatedRange = this.resolve(this.range());
      this.point2Mode = 'duration';
      this.point2range = 'after';
      this.point2offset = Math.abs(calculatedRange.end.getTime() - calculatedRange.start.getTime());
    } else {
      this.updateSimpleMode(this.range());
    }
  }

  private updateSimpleMode(newRange: DateRangeFilter): void {
    if (this.inputMode()) {
      this.range.update(oldRange => ({
        ...oldRange,
        point1: newRange.point1
      }));
      // input mode supports `now`, so point1 needs to remain unchanged
      if (newRange.point1 === 'now') {
        this.point1Now = true;
        this.point1date = this.getDateNow();
      } else {
        this.point1Now = false;
        this.point1date = newRange.point1;
      }
      const calculatedRange = this.resolve(newRange, true);
      this.point2Mode = 'date';
      this.point2date = calculatedRange.end;
      this.range.update(oldRange => ({
        ...oldRange,
        range: undefined,
        point2: calculatedRange.end
      }));
    } else {
      this.point1Now = false;
      this.updateDateRange(newRange);
      this.updateFromDateRange();
    }
  }

  protected updateFromDateRange(): void {
    const startDate = this.dateRange.start ?? this.getDateNow();
    const endDate = this.dateRange.end ?? this.getDateNow();
    this.point1date = startDate;
    this.point2date = startDate;
    this.range.set({
      point1: startDate,
      point2: endDate,
      range: undefined
    });
    this.point2Mode = 'date';
    this.point2offset = 0;
  }

  protected point1Changed(): void {
    if (this.point1Now) {
      this.range.update(oldRange => ({ ...oldRange, point1: 'now' }));
      this.point1date = this.getDateNow();
      if (this.point2Mode !== 'date') {
        this.point2range ??= 'before';
      }
    } else {
      this.range.update(oldRange => ({ ...oldRange, point1: this.point1date ?? new Date(NaN) }));
    }
  }

  protected point2Changed(): void {
    if (this.point2Mode === 'date') {
      if (!(this.range().point2 instanceof Date)) {
        const calculatedRange = this.resolve(this.range());
        if (calculatedRange.valid) {
          this.point2date =
            this.point1date < calculatedRange.end ? calculatedRange.start : calculatedRange.end;
        }
      }
      this.range.update(oldRange => ({
        ...oldRange,
        range: undefined,
        point2: this.point2date
      }));
    } else {
      this.range.update(oldRange => ({
        ...oldRange,
        range: this.point2range
      }));
      if (this.range().point2 instanceof Date) {
        const calculatedRange = this.resolve(this.range());
        this.point2offset = Math.round(
          calculatedRange.end.getTime() - calculatedRange.start.getTime()
        );
      }
      this.range.update(oldRange => ({
        ...oldRange,
        point2: this.point2offset
      }));
    }
  }

  protected selectPresetItem(event: Event, item: DateRangePreset): void {
    const newRange: DateRangeFilter =
      item.type === 'custom'
        ? item.calculate(item, this.range())
        : { point1: 'now', range: 'before', point2: item.offset };
    if (this.advancedMode) {
      Object.assign(this.range(), newRange);
      this.updateFromRange();
    } else {
      this.updateSimpleMode(newRange);
    }
    if (this.smallScreen) {
      // Prevent re-opening the dropdown when pressing enter on the selected item
      event.preventDefault();
      this.presetOpen.set(false);
    }
  }
}
