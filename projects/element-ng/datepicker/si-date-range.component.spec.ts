/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  DatepickerInputConfig,
  DateRange,
  SiDatepickerModule,
  SiDateRangeComponent,
  SiDateRangeComponent as TestComponent
} from '.';
import { backdropClick, CalenderTestHelper, enterValue } from './components/test-helper.spec';
import { addDays } from './date-time-helper';
import { SiDateRangeComponentHarness } from './testing/si-date-range.harness';
import { SiDatepickerComponentHarness } from './testing/si-datepicker.harness';

const startInput = (element: HTMLElement): HTMLInputElement =>
  element.querySelectorAll<HTMLInputElement>('input')[0];
const endInput = (element: HTMLElement): HTMLInputElement =>
  element.querySelectorAll<HTMLInputElement>('input')[1];

@Component({
  imports: [SiDatepickerModule, FormsModule, ReactiveFormsModule, TestComponent],
  template: `<si-date-range
    [siDatepickerConfig]="{ dateFormat: 'dd-MM-yyyy' }"
    [autoClose]="autoClose"
    [formControl]="dateRange"
    (siDatepickerRangeChange)="rangeChanged($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  dateRange = new FormControl<DateRange | null>(null);
  readonly siDateRangeComponent = viewChild.required(SiDateRangeComponent);
  autoClose = false;
  rangeChanged(event: DateRange): void {}
}

describe('SiDateRangeComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: SiDateRangeComponent;
  let element: HTMLElement;
  let loader: HarnessLoader;

  const openCalendarButton = (): HTMLElement =>
    element.querySelector<HTMLElement>('[aria-label="Open calendar"]')!;

  beforeEach(async () => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance.siDateRangeComponent();
    element = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    component.siDatepickerConfig.set({
      dateFormat: 'dd-MM-yyyy'
    });
    fixture.detectChanges();
    expect(element).toBeDefined();
  });

  it('should show datepicker overlay on button click', async () => {
    openCalendarButton().click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('si-datepicker-overlay')).toBeTruthy();
  });

  it('should mark input touched when on datepicker backdrop click', () => {
    openCalendarButton()!.click();
    expect(fixture.componentInstance.dateRange.touched).toBeFalse();

    backdropClick(fixture);
    expect(fixture.componentInstance.dateRange.touched).toBeTrue();
  });

  it('should mark input as touched once the focused is moved outside', async () => {
    const rangeHarness = await loader.getHarness(SiDateRangeComponentHarness);
    const inputs = await rangeHarness.getInputs();
    const calendarButton = await rangeHarness.getCalendarButton();
    await inputs.at(0)?.focus();
    await inputs.at(1)?.focus();
    await calendarButton.focus();
    expect(fixture.componentInstance.dateRange.touched).toBeFalse();
    await calendarButton.blur();
    expect(fixture.componentInstance.dateRange.touched).toBeTruthy();
  });

  describe('with autoClose', () => {
    beforeEach(() => {
      fixture.componentInstance.autoClose = true;
      fixture.autoDetectChanges();
      openCalendarButton().click();
    });

    it('should close after range selection via click', async () => {
      const helper = new CalenderTestHelper(document.querySelector('si-datepicker-overlay')!);
      helper.getEnabledCellWithText('1')!.click();
      helper.getEnabledCellWithText('3')!.click();
      await fixture.whenStable();
      expect(document.querySelector('si-datepicker-overlay')).toBeFalsy();
    });
  });

  it('should preview month range on hover', async () => {
    // Given:
    // - Start date selected 01.03.2023
    // - Month view opened
    // When:
    // - Hovering over a December
    // Then:
    // - April to December should be highlighted
    fixture.componentInstance.dateRange.setValue({ start: new Date(2023, 2, 1), end: undefined });
    openCalendarButton().click();
    // In case the small screen media query match we need to wait for the dialog animation
    await fixture.whenStable();

    const helper = new CalenderTestHelper(document.querySelector('si-datepicker-overlay')!);
    helper.getOpenMonthViewLink().click();
    helper.getEnabledCellWithText('December')!.dispatchEvent(new Event('mouseover'));

    expect(helper.queryAsArray('.range-hover')).toHaveSize(9);
  });

  it('should preview month range with second calendar', async () => {
    // Given:
    // - Start date selected 01.03.2023
    // - Month view opened
    // When:
    // - Hovering over a month December 2024 (second calendar)
    // Then:
    // - April 2023 to December 2024 (count=21) should be highlighted
    component.siDatepickerConfig.set({
      enableDateRange: true,
      enableTwoMonthDateRange: true,
      onlyMonthSelection: true
    });
    fixture.componentInstance.dateRange.setValue({ start: new Date(2023, 2, 1), end: undefined });
    openCalendarButton().click();
    // In case the small screen media query match we need to wait for the dialog animation
    await fixture.whenStable();

    const helper = new CalenderTestHelper(
      document.querySelectorAll<HTMLElement>('si-datepicker')[1]
    );
    helper.getEnabledCellWithText('December')!.dispatchEvent(new Event('mouseover'));
    expect(Array.from(document.querySelectorAll<HTMLElement>('.range-hover'))).toHaveSize(21);
  });

  it('should not overlap month view with enableTwoMonthDateRange when pressing previous year button', async () => {
    // Given:
    // - config enableTwoMonthDateRange = true and onlyMonthSelection = true
    // - Selected range 03/2023 - 04/2024
    // When:
    // - Pressing previous year button on the second calendar
    // Then:
    // - The active year in the first calendar shall switch to 2022
    component.siDatepickerConfig.set({
      enableDateRange: true,
      enableTwoMonthDateRange: true,
      onlyMonthSelection: true
    });
    fixture.componentInstance.dateRange.setValue({
      start: new Date(2023, 1, 1),
      end: new Date(2023, 3, 1)
    });
    openCalendarButton().click();

    const calendars = document.querySelectorAll<HTMLElement>('si-datepicker');
    const firstCalendar = new CalenderTestHelper(calendars[0]);
    const secondCalendar = new CalenderTestHelper(calendars[1]);
    secondCalendar.getPreviousButton()!.click();
    expect(firstCalendar.getOpenYearViewLink().textContent).toContain('2022');
  });

  it('should output correct month range on keyboard input', async () => {
    const spy = spyOn(fixture.componentInstance, 'rangeChanged');
    component.siDatepickerConfig.set({
      enableDateRange: true,
      enableTwoMonthDateRange: true,
      onlyMonthSelection: true
    });
    fixture.detectChanges();
    enterValue(startInput(element), '05-2023');
    startInput(element).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    const dateRange = spy.calls.mostRecent().args[0];
    expect(dateRange.end).toBeNull();
    expect(dateRange.start).toEqual(new Date(2023, 4, 1));
  });
});

@Component({
  imports: [SiDatepickerModule, FormsModule, ReactiveFormsModule, TestComponent],
  template: `<form [formGroup]="form">
    <si-date-range formControlName="dateRange" [siDatepickerConfig]="config()" />
  </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormWrapperComponent {
  form = new FormGroup({
    dateRange: new FormControl()
  });
  readonly config = signal<DatepickerInputConfig>({ dateFormat: 'dd-MM-yyyy' });

  readonly siDateRangeComponent = viewChild.required(SiDateRangeComponent);
}
describe('SiDateRangeComponent within form', () => {
  let fixture: ComponentFixture<FormWrapperComponent>;
  let component: FormWrapperComponent;
  let element: HTMLElement;
  let rootLoader: HarnessLoader;

  const updateConfig = (c: DatepickerInputConfig): void => {
    component.config.set(c);
    fixture.detectChanges();
  };

  const openCalendarButton = (): HTMLElement =>
    element.querySelector<HTMLElement>('[aria-label="Open calendar"]')!;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FormWrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should not preview range when when start and end date are set by form-control', async () => {
    const control = component.form.controls.dateRange;
    control.valueChanges.subscribe(value => {
      const { start, end } = value;
      // Update date-range
      if (start && !end) {
        setTimeout(() =>
          control.setValue(
            {
              start: start,
              end: addDays(start, 6)
            },
            { emitEvent: false }
          )
        );
      }
    });

    openCalendarButton().click();
    const helper = new CalenderTestHelper(document.querySelector('si-datepicker-overlay')!);
    helper.clickEnabledCell('1');
    await fixture.whenStable();

    helper.getEnabledCellWithText('20')?.dispatchEvent(new Event('mouseover'));
    expect(helper.getEnabledCellWithText('20')?.classList).not.toContain('range-hover');
  });

  describe('with input validation', () => {
    it('should validate start date format', async () => {
      enterValue(startInput(element), 'INVALID DATE');
      startInput(element).dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        invalidStartDateFormat: { format: 'dd-MM-yyyy' }
      });
    });

    it('should validate end date format', async () => {
      enterValue(endInput(element), 'INVALID DATE');
      endInput(element).dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        invalidEndDateFormat: { format: 'dd-MM-yyyy' }
      });
    });

    it('should validate start min date', async () => {
      updateConfig({ minDate: new Date(2023, 1, 1) });
      enterValue(startInput(element), '01-01-2023');
      startInput(element).dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        rangeBeforeMinDate: {
          min: component.config().minDate,
          start: new Date(2023, 0, 1),
          end: null
        }
      });
    });

    it('should validate end min date', async () => {
      updateConfig({ minDate: new Date(2023, 1, 1) });
      enterValue(endInput(element), '01-01-2023');
      endInput(element).dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        rangeBeforeMinDate: {
          min: component.config().minDate,
          start: null,
          end: new Date(2023, 0, 1)
        }
      });
    });

    it('should validate start max date', async () => {
      updateConfig({ maxDate: new Date(2023, 0, 1) });
      enterValue(startInput(element), '02-01-2023');
      startInput(element).dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        rangeAfterMaxDate: {
          max: component.config().maxDate,
          start: new Date(2023, 1, 1),
          end: null
        }
      });
    });

    it('should validate end max date', async () => {
      updateConfig({ maxDate: new Date(2023, 0, 1) });
      enterValue(endInput(element), '02-01-2023');
      endInput(element).dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(false);
      expect(component.form.controls.dateRange.errors).toEqual({
        rangeAfterMaxDate: {
          max: component.config().maxDate,
          start: null,
          end: new Date(2023, 1, 1)
        }
      });
    });

    it('should allow date selection in overlay also with invalid start input', async () => {
      updateConfig({ minDate: new Date(2023, 0, 5), maxDate: new Date(2023, 0, 25) });
      enterValue(startInput(element), '02');

      openCalendarButton().click();

      const picker = await rootLoader.getHarness(SiDatepickerComponentHarness);
      await picker.selectCell({ text: '15' });
      await picker.selectCell({ text: '25' });
      backdropClick(fixture);

      expect(component.form.valid).toBe(true);
      expect(component.form.value.dateRange).toEqual({
        start: new Date(2023, 0, 15),
        end: new Date(2023, 0, 25)
      });
    });
  });
});
