/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { MediaMatcher } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestScheduler } from 'rxjs/testing';

import { DateRangeFilter, DateRangePreset, SiDateRangeFilterComponent } from './index';

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = ONE_MINUTE * 60 * 24;

const getRangePastMonth = (): DateRangeFilter => {
  const now = new Date();
  return {
    point1: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    point2: new Date(now.getFullYear(), now.getMonth(), 0)
  };
};

const defaultPresetList: DateRangePreset[] = [
  { label: 'last minute', offset: 1000 * 60 },
  { label: 'last hour', offset: 1000 * 60 * 60 },
  { label: 'last 24h', offset: ONE_DAY },
  { label: 'last 7 days', offset: ONE_DAY * 7 },
  { label: 'last 30 days', offset: ONE_DAY * 30 },
  { label: 'last 60 days', offset: ONE_DAY * 60 },
  { label: 'last 90 days', offset: ONE_DAY * 90 },
  { label: 'last year', offset: ONE_DAY * 365 },
  { type: 'custom', label: 'past month', calculate: () => getRangePastMonth() }
];

describe('SiDateRangeFilterComponent', () => {
  let fixture: ComponentFixture<SiDateRangeFilterComponent>;
  let element: HTMLElement;
  let range: WritableSignal<DateRangeFilter>;
  let presetList: WritableSignal<DateRangePreset[] | undefined>;
  let enableTimeSelection: WritableSignal<boolean>;
  let basicMode: WritableSignal<'input' | 'calendar'>;

  const rangeInputValue = (): number | undefined =>
    element.querySelector<HTMLInputElement>('si-relative-date input')?.valueAsNumber;
  const rangeSelectContent = (): string | undefined | null =>
    element.querySelector('si-select div')?.textContent;
  const preview = (): string | undefined => element.querySelector('.preview')?.textContent?.trim();
  const date2string = (date: Date, time = false): string =>
    formatDate(date, time ? 'short' : 'shortDate', 'en');
  const rangeText = (from: Date, to: Date, time = false): string =>
    date2string(from, time) + ' - ' + date2string(to, time);
  const advancedMode = (): boolean =>
    element.querySelector<HTMLInputElement>('input[name=advancedMode]')?.checked ?? false;
  const toggleMode = (): void =>
    element.querySelector<HTMLInputElement>('input[name=advancedMode]')?.click();
  const presetItems = (): NodeListOf<HTMLElement> =>
    element.querySelectorAll<HTMLElement>('.preset-item');

  const dateInput = (name: string, value: string): void => {
    const el = element.querySelector<HTMLInputElement>(`input[name=${name}]`)!;
    el.value = value;
    el.dispatchEvent(new Event('input'));
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MediaMatcher,
          useValue: {
            /** Enforce desktop layout width 768px  */
            matchMedia: (
              query: string
            ): {
              matches: boolean;
              addListener: (h: any) => void;
              removeListener: (h: any) => void;
            } => {
              return {
                matches: false,
                addListener: (h: any) => {},
                removeListener: (h: any) => {}
              };
            }
          }
        }
      ]
    })
  );

  beforeEach(() => {
    range = signal<DateRangeFilter>({ point1: 'now', point2: 2 * ONE_DAY, range: 'before' });
    presetList = signal<DateRangePreset[] | undefined>([...defaultPresetList]);
    enableTimeSelection = signal(false);
    basicMode = signal<'input' | 'calendar'>('calendar');

    fixture = TestBed.createComponent(SiDateRangeFilterComponent, {
      bindings: [
        twoWayBinding('range', range),
        inputBinding('presetList', presetList),
        inputBinding('enableTimeSelection', enableTimeSelection),
        inputBinding('basicMode', basicMode)
      ]
    });
    element = fixture.nativeElement;
  });

  it('pre-selects matching offset, shows range "before"', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    const to = new Date();
    const from = new Date(to.getTime() - 2 * ONE_DAY);

    expect(advancedMode()).toBe(true);
    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to));
  });

  it('pre-selects matching offset, shows range "after"', async () => {
    range.set({ ...range(), range: 'after' });
    await fixture.whenStable();

    const from = new Date();
    const to = new Date(from.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBe(true);
    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to));
    expect(element.querySelector('input[name=point2range][value=after]:checked')).toBeTruthy();
  });

  it('pre-selects with two dates', async () => {
    const from = new Date('2023-05-13');
    const to = new Date('2023-08-14');

    range.set({ point1: from, point2: to });

    await fixture.whenStable();

    expect(preview()).toEqual(rangeText(from, to));
    expect(advancedMode()).toBe(false);
    expect(date2string(range().point1 as Date)).toEqual(date2string(from));
    expect(date2string(range().point2 as Date)).toEqual(date2string(to));
    expect(range().range).toBeUndefined();
  });

  it('shows range for "after"', async () => {
    await fixture.whenStable();

    element.querySelectorAll<HTMLElement>('.range-type label')[1]?.click();
    await fixture.whenStable();

    const from = new Date();
    const to = new Date(from.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBe(true);
    expect(preview()).toEqual(rangeText(from, to));
    expect(range().point1).toEqual('now');
    expect(range().point2).toEqual(2 * ONE_DAY);
    expect(range().range).toEqual('after');
  });

  it('shows range for "within"', async () => {
    await fixture.whenStable();

    element.querySelectorAll<HTMLElement>('.range-type label')[2]?.click();
    await fixture.whenStable();

    const now = new Date();
    const from = new Date(now.getTime() - 2 * ONE_DAY);
    const to = new Date(now.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBe(true);
    expect(preview()).toEqual(rangeText(from, to));
    expect(range().point1).toEqual('now');
    expect(range().point2).toEqual(2 * ONE_DAY);
    expect(range().range).toEqual('within');
  });

  it('allows selecting two dates', async () => {
    basicMode.set('input');
    await fixture.whenStable();
    toggleMode();
    await fixture.whenStable();

    element.querySelector<HTMLElement>('input.form-check-input[type=checkbox]')?.click();

    dateInput('point1', '05/13/2023');
    dateInput('point2', '08/14/2023');
    fixture.detectChanges();
    await fixture.whenStable();

    const from = new Date('2023-05-13');
    const to = new Date('2023-08-14');

    expect(preview()).toEqual(rangeText(from, to));
    expect(date2string(range().point1 as Date)).toEqual(date2string(from));
    expect(date2string(range().point2 as Date)).toEqual(date2string(to));
    expect(range().range).toBeUndefined();
  });

  it('allows selecting presets', async () => {
    await fixture.whenStable();

    // select 'after' to test for 'before' afterwards
    element.querySelectorAll<HTMLElement>('.range-type label')[1]?.click();
    await fixture.whenStable();

    presetItems()[1]?.click();
    await fixture.whenStable();

    expect(rangeInputValue()).toBe(1);
    expect(rangeSelectContent()).toBe('Weeks');
    expect(range().point1).toEqual('now');
    expect(range().point2).toEqual(7 * ONE_DAY);
    expect(range().range).toEqual('before');

    const activeButton = element.querySelector('.range-type input:checked + span');
    expect(activeButton?.textContent).toContain('Before');
  });

  it('switches from advanced to simple mode with calendar', async () => {
    await fixture.whenStable();
    toggleMode();
    await fixture.whenStable();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(today.getTime() - 2 * ONE_DAY);

    expect(range().point1).toEqual(twoDaysAgo);
    expect(range().point2).toEqual(today);
    expect(range().range).toBeUndefined();
  });

  it('switches from advanced to simple mode with inputs', async () => {
    basicMode.set('input');
    await fixture.whenStable();
    toggleMode();
    await fixture.whenStable();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(today.getTime() - 2 * ONE_DAY);

    expect(range().point1).toEqual('now');
    expect(range().point2).toEqual(twoDaysAgo);
    expect(range().range).toBeUndefined();
  });

  it('switches from simple mode to advanced mode', async () => {
    const point1 = new Date('2023-05-13');
    const point2 = new Date('2023-08-14');
    range.set({ point1, point2 });
    fixture.detectChanges();
    await fixture.whenStable();

    toggleMode();
    await fixture.whenStable();

    expect(date2string(range().point1 as Date)).toEqual(date2string(point1));
    expect(range().point2).toEqual(point2.getTime() - point1.getTime());
    expect(range().range).toBe('after');
  });

  it('allows selecting presets in simple mode', async () => {
    range.set({
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    });
    fixture.detectChanges();
    await fixture.whenStable();

    presetItems()[1]?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * ONE_DAY);

    expect(range().point1).toEqual(oneWeekAgo);
    expect(range().point2).toEqual(today);
    expect(range().range).toBeUndefined();
    expect(
      fixture.debugElement.query(
        By.css(`button.si-calendar-date-cell[aria-label="${oneWeekAgo.toDateString()}"]`)
      )
    ).toBeTruthy();
  });

  it('selecting presets in input mode keeps now', async () => {
    basicMode.set('input');
    range.set({
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    });

    await fixture.whenStable();

    presetItems()[1]?.click();
    await fixture.whenStable();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * ONE_DAY);

    expect(range().point1).toEqual('now');
    expect(range().point2).toEqual(oneWeekAgo);
    expect(range().range).toBeUndefined();

    // also test that 'now' is disabled again
    const presets = presetItems();
    presets[presets.length - 1]?.click();
    await fixture.whenStable();

    const pastMonth = getRangePastMonth();

    expect(range().point1).toEqual(pastMonth.point1);
    expect(range().point2).toEqual(pastMonth.point2);
    expect(range().range).toBeUndefined();
  });

  it('allows presets with custom calculation', async () => {
    range.set({
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    });

    await fixture.whenStable();

    const presets = presetItems();
    presets[presets.length - 1]?.click();
    await fixture.whenStable();

    const pastMonth = getRangePastMonth();

    expect(range().point1).toEqual(pastMonth.point1);
    expect(range().point2).toEqual(pastMonth.point2);
    expect(range().range).toBeUndefined();
  });

  it('allows filtering presets', async () => {
    await fixture.whenStable();

    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ flush }) => {
      const searchInput = element.querySelector<HTMLInputElement>('si-search-bar input')!;
      searchInput.value = '30';
      searchInput.dispatchEvent(new Event('input'));
      flush();
      fixture.detectChanges();

      expect(document.querySelector('.preset-select')).toBeTruthy();
      const presets = presetItems();
      expect(presets.length).toBe(1);
    });
  });

  it('hides the preset list when no presets given', async () => {
    presetList.set(undefined);
    await fixture.whenStable();

    expect(document.querySelector('.preset-select')).toBeFalsy();
  });

  it('handles time selection', async () => {
    enableTimeSelection.set(true);
    await fixture.whenStable();

    const to = new Date();
    const from = new Date(to.getTime() - 2 * ONE_DAY);

    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to, true));
  });
});
