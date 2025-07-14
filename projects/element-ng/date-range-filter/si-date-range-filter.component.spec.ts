/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

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

@Component({
  imports: [SiDateRangeFilterComponent],
  template: `
    <si-date-range-filter
      [presetList]="presetList"
      [enableTimeSelection]="enableTimeSelection"
      [basicMode]="inputMode ? 'input' : 'calendar'"
      [(range)]="range"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly component = viewChild.required(SiDateRangeFilterComponent);
  range: DateRangeFilter = { point1: 'now', point2: 2 * ONE_DAY, range: 'before' };

  enableTimeSelection = false;
  inputMode = false;

  presetList?: DateRangePreset[] = [
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
}

describe('SiDateRangeFilterComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

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
  const presetList = (): NodeListOf<HTMLElement> =>
    element.querySelectorAll<HTMLElement>('.preset-item');

  const dateInput = (name: string, value: string): void => {
    const el = element.querySelector<HTMLInputElement>(`input[name=${name}]`)!;
    el.value = value;
    el.dispatchEvent(new Event('input'));
  };

  const updateView = (): void => {
    // twice because of si-number-input
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    flush();
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('pre-selects matching offset, shows range "before"', fakeAsync(() => {
    updateView();

    const to = new Date();
    const from = new Date(to.getTime() - 2 * ONE_DAY);

    expect(advancedMode()).toBeTrue();
    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to));
  }));

  it('pre-selects matching offset, shows range "after"', fakeAsync(() => {
    component.range.range = 'after';
    updateView();

    const from = new Date();
    const to = new Date(from.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBeTrue();
    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to));
    expect(element.querySelector('input[name=point2range][value=after]:checked')).toBeTruthy();
  }));

  it('pre-selects with two dates', fakeAsync(() => {
    const from = new Date('2023-05-13');
    const to = new Date('2023-08-14');

    component.range = {
      point1: from,
      point2: to
    };

    updateView();

    expect(preview()).toEqual(rangeText(from, to));
    expect(advancedMode()).toBeFalse();
    expect(date2string(component.range.point1 as Date)).toEqual(date2string(from));
    expect(date2string(component.range.point2 as Date)).toEqual(date2string(to));
    expect(component.range.range).toBeUndefined();
  }));

  it('shows range for "after"', fakeAsync(() => {
    updateView();

    element.querySelectorAll<HTMLElement>('.range-type label')[1]?.click();
    updateView();

    const from = new Date();
    const to = new Date(from.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBeTrue();
    expect(preview()).toEqual(rangeText(from, to));
    expect(component.range.point1).toEqual('now');
    expect(component.range.point2).toEqual(2 * ONE_DAY);
    expect(component.range.range).toEqual('after');
  }));

  it('shows range for "within"', fakeAsync(() => {
    updateView();

    element.querySelectorAll<HTMLElement>('.range-type label')[2]?.click();
    updateView();

    const now = new Date();
    const from = new Date(now.getTime() - 2 * ONE_DAY);
    const to = new Date(now.getTime() + 2 * ONE_DAY);

    expect(advancedMode()).toBeTrue();
    expect(preview()).toEqual(rangeText(from, to));
    expect(component.range.point1).toEqual('now');
    expect(component.range.point2).toEqual(2 * ONE_DAY);
    expect(component.range.range).toEqual('within');
  }));

  it('allows selecting two dates', fakeAsync(() => {
    component.inputMode = true;
    updateView();
    toggleMode();
    updateView();

    element.querySelector<HTMLElement>('input.form-check-input[type=checkbox]')?.click();
    updateView();

    dateInput('point1', '05/13/2023');
    dateInput('point2', '08/14/2023');
    tick(200);
    fixture.detectChanges();

    const from = new Date('2023-05-13');
    const to = new Date('2023-08-14');

    expect(preview()).toEqual(rangeText(from, to));
    expect(date2string(component.range.point1 as Date)).toEqual(date2string(from));
    expect(date2string(component.range.point2 as Date)).toEqual(date2string(to));
    expect(component.range.range).toBeUndefined();
  }));

  it('allows selecting presets', fakeAsync(() => {
    updateView();

    // select 'after' to test for 'before' afterwards
    element.querySelectorAll<HTMLElement>('.range-type label')[1]?.click();
    updateView();

    presetList()[1]?.click();
    updateView();

    expect(rangeInputValue()).toBe(1);
    expect(rangeSelectContent()).toBe('Weeks');
    expect(component.range.point1).toEqual('now');
    expect(component.range.point2).toEqual(7 * ONE_DAY);
    expect(component.range.range).toEqual('before');

    const activeButton = element.querySelector('.range-type input:checked + span');
    expect(activeButton?.textContent).toContain('Before');
  }));

  it('switches from advanced to simple mode with calendar', fakeAsync(() => {
    updateView();
    toggleMode();
    updateView();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(today.getTime() - 2 * ONE_DAY);

    expect(component.range.point1).toEqual(twoDaysAgo);
    expect(component.range.point2).toEqual(today);
    expect(component.range.range).toBeUndefined();
  }));

  it('switches from advanced to simple mode with inputs', fakeAsync(() => {
    component.inputMode = true;
    updateView();
    toggleMode();
    updateView();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(today.getTime() - 2 * ONE_DAY);

    expect(component.range.point1).toEqual('now');
    expect(component.range.point2).toEqual(twoDaysAgo);
    expect(component.range.range).toBeUndefined();
  }));

  it('allows selecting presets in simple mode', fakeAsync(() => {
    component.range = {
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    };

    updateView();

    presetList()[1]?.click();
    updateView();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * ONE_DAY);

    expect(component.range.point1).toEqual(oneWeekAgo);
    expect(component.range.point2).toEqual(today);
    expect(component.range.range).toBeUndefined();
  }));

  it('selecting presets in input mode keeps now', fakeAsync(() => {
    component.inputMode = true;
    component.range = {
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    };

    updateView();

    presetList()[1]?.click();
    updateView();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * ONE_DAY);

    expect(component.range.point1).toEqual('now');
    expect(component.range.point2).toEqual(oneWeekAgo);
    expect(component.range.range).toBeUndefined();

    // also test that 'now' is disabled again
    const presets = presetList();
    presets[presets.length - 1]?.click();
    updateView();

    const range = getRangePastMonth();

    expect(component.range.point1).toEqual(range.point1);
    expect(component.range.point2).toEqual(range.point2);
    expect(component.range.range).toBeUndefined();
  }));

  it('allows presets with custom calculation', fakeAsync(() => {
    component.range = {
      point1: new Date('2023-05-13'),
      point2: new Date('2023-08-14')
    };

    updateView();

    const presets = presetList();
    presets[presets.length - 1]?.click();
    updateView();

    const range = getRangePastMonth();

    expect(component.range.point1).toEqual(range.point1);
    expect(component.range.point2).toEqual(range.point2);
    expect(component.range.range).toBeUndefined();
  }));

  it('allows filtering presets', fakeAsync(() => {
    updateView();

    const searchInput = element.querySelector<HTMLInputElement>('si-search-bar input')!;
    searchInput.value = '30';
    searchInput.dispatchEvent(new Event('input'));
    tick(400); // debounce time in search bar
    updateView();

    expect(document.querySelector('.preset-select')).toBeTruthy();
    const presets = presetList();
    expect(presets.length).toBe(1);
  }));

  it('hides the preset list when no presets given', fakeAsync(() => {
    component.presetList = undefined;
    updateView();

    expect(document.querySelector('.preset-select')).toBeFalsy();
  }));

  it('handles time selection', fakeAsync(() => {
    component.enableTimeSelection = true;
    updateView();

    const to = new Date();
    const from = new Date(to.getTime() - 2 * ONE_DAY);

    expect(rangeInputValue()).toBe(2);
    expect(rangeSelectContent()).toBe('Days');
    expect(preview()).toEqual(rangeText(from, to, true));
  }));
});
