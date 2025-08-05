/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';

import { backdropClick, CalendarTestHelper, generateKeyEvent } from './components/test-helper.spec';
import { SiDatepickerOverlayDirective } from './si-datepicker-overlay.directive';
import { SiDatepickerDirective } from './si-datepicker.directive';
import { DatepickerInputConfig } from './si-datepicker.model';
import { SiDatepickerModule } from './si-datepicker.module';
import { SiDatepickerDirectiveComponentHarness } from './testing/si-datepicker.directive.harness';
import { SiDatepickerComponentHarness } from './testing/si-datepicker.harness';

export type Spied<T> = {
  [Method in keyof T]: jasmine.Spy;
};

@Component({
  imports: [SiDatepickerModule, FormsModule],
  template: `<input
    #siDatePicker
    #validation="ngModel"
    type="text"
    placeholder="siDatepicker"
    class="form-control"
    siDatepicker
    [autoClose]="autoClose"
    [siDatepickerConfig]="config()"
    [ngModelOptions]="{ standalone: true }"
    [ngModel]="date()"
    (ngModelChange)="date.set($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly siDatePicker = viewChild.required<ElementRef>('siDatePicker');
  readonly validation = viewChild.required<NgControl>('validation');
  readonly siDatePickerDirective = viewChild.required(SiDatepickerDirective);
  readonly overlayDirective = viewChild.required(SiDatepickerOverlayDirective);
  readonly date = signal<Date | string>(new Date('2022-03-12'));
  readonly config = signal<DatepickerInputConfig>({
    showTime: true,
    disabledTime: false,
    dateTimeFormat: 'mediumTime'
  });
  autoClose = false;
}

describe('SiDatepickerDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let element: HTMLElement;
  let rootLoader: HarnessLoader;

  /** Update datepicker configuration */
  const updateConfig = async (c: DatepickerInputConfig): Promise<void> => {
    component.config.set(c);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const changeDate = async (d: Date): Promise<void> => {
    component.date.set(d);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const getInput = (): HTMLInputElement => element.querySelector<HTMLInputElement>('input')!;

  /** Close datepicker overlay with Escape */
  const closeOverlayWithEscape = async (): Promise<void> => {
    const dayView = document.querySelector('si-day-selection');
    dayView?.dispatchEvent(generateKeyEvent('Escape'));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const getTestDate = (): Date => new Date('2022-03-12T05:30:20');

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    fixture.detectChanges();
  });

  describe('with minDate and maxDate', () => {
    beforeEach(async () => {
      await updateConfig({
        showTime: true,
        showSeconds: true,
        minDate: new Date('2021-03-12'),
        maxDate: new Date('2023-03-12')
      });
    });

    it('should validate minDate', async () => {
      await changeDate(new Date('2020-03-12'));

      expect(component.validation().errors?.minDate).toEqual({
        actual: component.date(),
        min: component.config().minDate
      });
    });

    it('should validate maxDate', async () => {
      await changeDate(new Date('2024-03-12'));

      expect(component.validation().errors?.maxDate).toEqual({
        actual: component.date(),
        max: component.config().maxDate
      });
    });
  });

  describe('with datepicker visible', () => {
    beforeEach(async () => {
      getInput().focus();

      expect(document.querySelector('si-datepicker-overlay')).toBeDefined();
    });

    it('should hide datepicker on focus out', async () => {
      getInput().blur();

      expect(document.querySelector('si-datepicker-overlay')).toBeNull();
    });

    it('should handle date change', async () => {
      const helper = new CalendarTestHelper(
        document.querySelector('si-day-selection') as HTMLElement
      );
      helper.getEnabledCells().at(0)?.dispatchEvent(new Event('click'));

      fixture.detectChanges();
      expect(component.date()).not.toBe('');
    });

    it('should consider short time format', async () => {
      await updateConfig({ showTime: true, dateTimeFormat: 'dd.MM.yyyy, HH:mm' });
      await changeDate(getTestDate());
      fixture.detectChanges();

      expect(component.siDatePicker().nativeElement.value).toBe('12.03.2022, 05:30');
    });

    it('should consider default time format if showSeconds true', async () => {
      await updateConfig({ showTime: true, showSeconds: true });
      await changeDate(getTestDate());
      fixture.detectChanges();
      expect(component.siDatePicker().nativeElement.value).toBe('3/12/2022, 5:30:20 AM');
    });

    it('should close overlay on click', async () => {
      backdropClick(fixture);
      expect(document.querySelector('si-datepicker-overlay')).toBeNull();
    });

    it('should toggle close and open overlay on two click', async () => {
      backdropClick(fixture);
      expect(document.querySelector('si-datepicker-overlay')).toBeNull();
      getInput().click();
      expect(document.querySelector('si-datepicker-overlay')).toBeTruthy();
    });

    it('should hide datepicker when on press Escape', async () => {
      const picker = await rootLoader.getHarness(SiDatepickerComponentHarness);
      await picker.selectCell({ isSelected: true });

      await closeOverlayWithEscape();

      expect(document.querySelector('si-datepicker-overlay')).toBeNull();
    });

    it('should allow to type a date in input while datepicker is open', async () => {
      await updateConfig({ showTime: true, dateTimeFormat: 'dd.MM.yyyy' });
      const input = await rootLoader.getHarness(SiDatepickerDirectiveComponentHarness);
      await (await input.focus()).clear();
      await input.sendKeys('1.1.2');
      expect(getInput().value).toEqual('1.1.2');
      expect(component.date()).toEqual(new Date('2002-01-01T00:00:00'));
    });
  });

  describe('with time and seconds', () => {
    beforeEach(async () => {
      await updateConfig({ showTime: true, showSeconds: true, disabledTime: false });

      getInput().focus();
    });

    it('should disable time when switch of Consider Time', async () => {
      const disabledTime$ = spyOn(
        component.siDatePickerDirective().siDatepickerDisabledTime,
        'emit'
      ).and.callThrough();

      const helper = new CalendarTestHelper(
        document.querySelector('si-datepicker-overlay') as HTMLElement
      );
      const considerTime = helper.getConsiderTimeSwitch();
      considerTime!.dispatchEvent(new Event('change'));

      expect(helper.getTimeInputHours().disabled).toBeTrue();
      expect(helper.getTimeInputMinutes().disabled).toBeTrue();
      expect(helper.getTimeInputSeconds().disabled).toBeTrue();
      expect(disabledTime$).toHaveBeenCalledWith(true);
    });
  });

  describe('with autoClose', () => {
    beforeEach(async () => {
      component.autoClose = true;
      await updateConfig({
        showTime: false
      });
      fixture.autoDetectChanges();
    });

    it('should close after selection via click', async () => {
      getInput().focus();
      const picker = await rootLoader.getHarness(SiDatepickerComponentHarness);
      await picker.selectCell({ text: '1' });

      expect(document.querySelector('si-datepicker-overlay')).toBeFalsy();
    });

    it('should close when switch of Consider Time', async () => {
      await updateConfig({
        showTime: true
      });
      getInput().focus();
      const picker = await rootLoader.getHarness(SiDatepickerComponentHarness);
      await (await picker.considerTimeSwitch()).toggle();

      expect(document.querySelector('si-datepicker-overlay')).toBeFalsy();
    });
  });
});
