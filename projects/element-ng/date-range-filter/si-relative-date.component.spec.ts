/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { t } from '@siemens/element-translate-ng/translate';

import { SiRelativeDateComponent } from './si-relative-date.component';

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = ONE_MINUTE * 60 * 24;

@Component({
  imports: [SiRelativeDateComponent],
  template: `<si-relative-date
    [enableTimeSelection]="enableTimeSelection"
    [unitLabel]="unitLabel"
    [valueLabel]="valueLabel"
    [(value)]="value"
  /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly value = signal(0);
  enableTimeSelection = false;
  unitLabel = t(() => $localize`:@@SI_DATE_RANGE_FILTER.UNIT:Unit`);
  valueLabel = t(() => $localize`:@@SI_DATE_RANGE_FILTER.UNIT:Unit`);
}

describe('SiRelativeDateComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  const inputValue = (): number | undefined => element.querySelector('input')?.valueAsNumber;
  const selectContent = (): string | undefined | null =>
    element.querySelector('si-select div')?.textContent;
  const inputAction = (selector: string): void => {
    const btn = element.querySelector('si-number-input ' + selector);
    btn?.dispatchEvent(new Event('mousedown'));
    btn?.dispatchEvent(new Event('mouseup'));
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiRelativeDateComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('pre-selects matching offset', async () => {
    component.value.set(2 * ONE_DAY);
    await fixture.whenStable();

    expect(inputValue()).toBe(2);
    expect(selectContent()).toBe('Days');

    component.value.set(88 * ONE_DAY);
    await fixture.whenStable();

    expect(inputValue()).toBe(88);
    expect(selectContent()).toBe('Days');
  });

  it('falls back to smallest unit', async () => {
    component.value.set(7 * ONE_DAY);
    await fixture.whenStable();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Weeks');

    component.value.set(0);
    await fixture.whenStable();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Days');
  });

  it('updates input values', async () => {
    component.value.set(2 * ONE_DAY);
    await fixture.whenStable();

    component.value.set(7 * ONE_DAY);
    await fixture.whenStable();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Weeks');
  });

  it('calculates and emits value/unit changes', async () => {
    component.value.set(7 * ONE_DAY);
    await fixture.whenStable();

    element.querySelector<HTMLElement>('si-select .select')?.click();
    await fixture.whenStable();
    document.querySelector<HTMLElement>('.dropdown-menu [data-id=weeks]')?.click();
    await fixture.whenStable();

    inputAction('.inc');
    await fixture.whenStable();

    expect(inputValue()).toBe(2);
    expect(component.value()).toBe(14 * ONE_DAY);
  });

  it('handles time selection', async () => {
    component.enableTimeSelection = true;
    await fixture.whenStable();

    element.querySelector<HTMLElement>('si-select .select')?.click();
    await fixture.whenStable();

    expect(document.querySelector<HTMLElement>('.dropdown-menu [data-id=minutes]')).toBeTruthy();
  });
});
