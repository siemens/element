/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiDatepickerComponent, SiDatepickerModule } from '.';
import { runOnPushChangeDetection } from '../test-helpers';
import { CalenderTestHelper, generateKeyEvent } from './components/test-helper.spec';
import { today } from './date-time-helper';
import { DatepickerConfig, DateRange } from './si-datepicker.model';
import { SiCalendarCellHarness } from './testing/si-calendar-cell.harness';
import { SiDatepickerComponentHarness } from './testing/si-datepicker.harness';

@Component({
  template: `<si-datepicker
    [config]="config()"
    [dateRange]="dateRange()"
    [date]="date()"
    (dateChange)="date.set($event); changedDate = $event"
    (dateRangeChange)="rangeChanged($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiDatepickerModule]
})
class TestHostComponent {
  readonly datePicker = viewChild.required(SiDatepickerComponent);
  readonly config = signal<DatepickerConfig>({});
  readonly date = signal<Date>(new Date());
  readonly dateRange = signal<DateRange | undefined>(undefined);
  changedDate?: Date;
  rangeChanged(event: DateRange): void {}
}

describe('SiDatepickerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let datePicker: SiDatepickerComponent;
  let element: HTMLElement;
  let helper: CalenderTestHelper;
  let loader: HarnessLoader;
  let picker: SiDatepickerComponentHarness;

  /** Update datepicker configuration */
  const updateConfig = async (c: DatepickerConfig): Promise<void> => {
    component.config.set(c);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    jasmine.clock().mockDate(new Date('2023-12-31'));
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.config.set({});
    component.date.set(new Date());
    datePicker = component.datePicker();
    element = fixture.nativeElement;
    helper = new CalenderTestHelper(element);
    loader = TestbedHarnessEnvironment.loader(fixture);
    picker = await loader.getHarness(SiDatepickerComponentHarness);
  });

  it('should includeTimeLabel matches enabledTimeText', async () => {
    const enabledTimeText = 'Consider Time';
    await updateConfig({ ...component.config(), enabledTimeText, showTime: true });

    expect(await picker.considerTimeLabel()).toBe(enabledTimeText);

    await updateConfig({ ...component.config(), enabledTimeText: undefined });
    expect(await picker.considerTimeLabel()).toBe('Consider time');
  });

  it('should includeTimeLabel matches disabledTimeText', async () => {
    const disabledTimeText = 'Disabled Time';
    await updateConfig({
      ...component.config(),
      disabledTimeText,
      showTime: true,
      disabledTime: true
    });

    expect(await picker.considerTimeLabel()).toBe('Disabled Time');

    await updateConfig({ ...component.config(), disabledTimeText: undefined });
    expect(await picker.considerTimeLabel()).toBe('Ignore time');
  });

  it('should toggle disabled time', async () => {
    component.date.set(new Date());
    await updateConfig({ ...component.config(), disabledTime: false, showTime: true });
    const spy = spyOn<any>(datePicker, 'toggleDisabledTime').and.callThrough();

    const toggleTimeSwitch = await picker.considerTimeSwitch();
    expect(await toggleTimeSwitch.isChecked()).toBeTrue();

    await toggleTimeSwitch.toggle();
    expect(spy).toHaveBeenCalled();
    expect(component.config().disabledTime).toBeTrue();

    await toggleTimeSwitch.toggle();
    expect(component.config().disabledTime).toBeFalse();
  });

  it('should ignore invalid dates', () => {
    component.date.set(new Date('*-*-*'));
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should select days in preview', async () => {
    // Select 1.January 2024
    await picker.selectCell({ text: '1', isPreview: true });

    expect(await (await picker.monthViewButton()).text()).toBe('January');
  });

  describe('with month view', () => {
    beforeEach(async () => {
      component.date.set(new Date('2022-01-31'));
      await await (await loader.getHarness(SiDatepickerComponentHarness)).showMonthView();
    });

    it('should show month view', async () => {
      expect(await (await loader.getHarness(SiDatepickerComponentHarness)).getCurrentView()).toBe(
        'month'
      );
    });

    it('should open year view', async () => {
      await picker.showYearView();
      expect(await picker.getCurrentView()).toBe('year');
    });

    it('should show day view', () => {
      helper.getActiveCell()?.click();
      fixture.detectChanges();
      expect(element.querySelector('si-day-selection')).toBeTruthy();
    });

    it('should focus 28.February in day view', async () => {
      await picker.selectCell({ text: 'February' });

      expect(await picker.getCurrentView()).toBe('day');
      expect(await (await picker.monthViewButton()).text()).toBe('February');
      expect(await (await picker.getCells({ isActive: true }))[0].getText()).toBe('28');
    });

    it('should synchronize focusDate between views', async () => {
      helper.getCalendarBody().dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      await picker.showYearView();
      helper.getCalendarBody().dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();
      helper.getActiveCell()?.click();
      fixture.detectChanges();

      expect(await (await picker.monthViewButton()).text()).toBe('February');
      expect(await (await picker.yearViewButton()).text()).toBe('2023');
      const cells = await picker.getCells({ isActive: true });
      expect(await cells[0].getText()).toBe('28');
    });
  });

  it('should handel date range selection', async () => {
    datePicker.dateRange.set({
      start: undefined,
      end: undefined
    });
    await updateConfig({ enableDateRange: true });

    const cells = await loader.getAllHarnesses(SiCalendarCellHarness.with({ isDisabled: false }));
    await cells[0].select();
    await cells[1].select();

    expect(datePicker.dateRange()?.start).toBeDefined();
    expect(datePicker.dateRange()?.end).toBeDefined();
  });

  it('should discard month selection when pressing Escape', async () => {
    await picker.showMonthView();

    helper.getCalendarBody()?.dispatchEvent(generateKeyEvent('Escape'));
    fixture.detectChanges();

    expect(await picker.getCurrentView()).toBe('day');
  });

  describe('with today button', () => {
    beforeEach(async () => {
      const d = today();
      d.setMonth(d.getMonth() - 2);
      component.date.set(d);
    });

    it('should show today button when date is in another month', async () => {
      expect(await picker.todayButton()).toBeTruthy();
    });

    it('should focus today date on today button press', async () => {
      await picker.showToday();

      const cells = await loader.getAllHarnesses(SiCalendarCellHarness.with({ isActive: true }));
      expect(await cells[0].getText()).toBe(today().getDate().toString());
    });
  });

  describe('with focused date tracked between views', () => {
    it('should synchronize focusedDate between views', async () => {
      await picker.showMonthView();
      await picker.next();

      const btn = await picker.yearViewButton();
      expect(await btn.text()).toBe('2024');
      await btn.click();

      const cells = await loader.getAllHarnesses(SiCalendarCellHarness.with({ isActive: true }));
      expect(await cells[0].getText()).toBe('2024');
    });
  });

  describe('with enableDateRange', () => {
    beforeEach(async () => {
      await updateConfig({ enableDateRange: true });
    });

    it('should select range', async () => {
      const spy = spyOn(component, 'rangeChanged');
      const cells = await loader.getAllHarnesses(SiCalendarCellHarness.with({ isDisabled: false }));
      // Select 1. and last of month
      for (const index of [0, -1]) {
        await cells.at(index)!.select();
      }

      expect(spy).toHaveBeenCalledTimes(2);
      expect(
        await loader.getAllHarnesses(SiCalendarCellHarness.with({ isSelected: true }))
      ).toHaveSize(2);
    });

    it('should select range crossing month boundary', async () => {
      const spy = spyOn(component, 'rangeChanged');

      // Select 15. of month
      await picker.selectCell({ text: '15' });
      // Switch to next month
      await picker.next();
      // Select second of month
      await picker.selectCell({ text: '2' });

      expect(spy).toHaveBeenCalledTimes(2);
      expect(
        await loader.getAllHarnesses(SiCalendarCellHarness.with({ isSelected: true }))
      ).toHaveSize(1);
    });

    it('should change start date when end is before start', async () => {
      const spy = spyOn(component, 'rangeChanged');

      // Select 16. and 15. of month
      await picker.selectCell({ text: '16' });
      await picker.selectCell({ text: '15' });

      expect(spy).toHaveBeenCalledTimes(2);
      const dateRange = spy.calls.mostRecent().args[0];
      expect(dateRange.end).toBeUndefined();
      expect(dateRange.start!.getDate()).toBe(15);
      expect(
        await loader.getAllHarnesses(SiCalendarCellHarness.with({ isSelected: true }))
      ).toHaveSize(1);
    });

    it('should start a new range selection when user clicks in between range', async () => {
      // Select 15. and 17. of month
      await picker.selectCell({ text: '15' });
      await picker.selectCell({ text: '17' });

      const spy = spyOn(component, 'rangeChanged');
      // Select 16. of month
      await picker.selectCell({ text: '16' });

      expect(spy).toHaveBeenCalledTimes(1);
      const dateRange = spy.calls.mostRecent().args[0];
      expect(dateRange.end).toBeUndefined();
      expect(dateRange.start!.getDate()).toBe(16);
      expect(
        await loader.getAllHarnesses(SiCalendarCellHarness.with({ isSelected: true }))
      ).toHaveSize(1);
    });

    it('should start a new range selection when user clicks behind range', async () => {
      // Select 15. and 17. of month
      await picker.selectCell({ text: '15' });
      await picker.selectCell({ text: '17' });

      const spy = spyOn(component, 'rangeChanged');
      // Select 18. of month
      await picker.selectCell({ text: '18' });
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      const dateRange = spy.calls.mostRecent().args[0];
      expect(dateRange.end).toBeUndefined();
      expect(dateRange.start!.getDate()).toBe(18);
      expect(
        await loader.getAllHarnesses(SiCalendarCellHarness.with({ isSelected: true }))
      ).toHaveSize(1);
    });

    it('should fallback to default value for invalid dates', async () => {
      component.dateRange.set({
        start: new Date(NaN),
        end: new Date(NaN)
      });
      await runOnPushChangeDetection(fixture);

      expect(
        await picker
          .getCells({ isDisabled: false, isPreview: false })
          .then(cells => cells[6].getText())
      ).toEqual('7');
    });
  });
});
