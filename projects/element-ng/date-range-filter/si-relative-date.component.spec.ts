/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { t } from '@siemens/element-translate-ng/translate';

import { SiRelativeDateComponent } from './si-relative-date.component';

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = ONE_MINUTE * 60 * 24;

@Component({
  imports: [SiRelativeDateComponent],
  template: `<si-relative-date
    [enableTimeSelection]="enableTimeSelection"
    [value]="value()"
    [unitLabel]="unitLabel"
    [valueLabel]="valueLabel"
    (valueChange)="value.set($event)"
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

  const updateView = (): void => {
    // twice because of si-number-input
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    flush();
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiRelativeDateComponent, TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('pre-selects matching offset', fakeAsync(() => {
    component.value.set(2 * ONE_DAY);
    updateView();

    expect(inputValue()).toBe(2);
    expect(selectContent()).toBe('Days');

    component.value.set(88 * ONE_DAY);
    updateView();

    expect(inputValue()).toBe(88);
    expect(selectContent()).toBe('Days');
  }));

  it('falls back to smallest unit', fakeAsync(() => {
    component.value.set(7 * ONE_DAY);
    updateView();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Weeks');

    component.value.set(0);
    updateView();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Days');
  }));

  it('updates input values', fakeAsync(() => {
    component.value.set(2 * ONE_DAY);
    updateView();

    component.value.set(7 * ONE_DAY);
    updateView();

    expect(inputValue()).toBe(1);
    expect(selectContent()).toBe('Weeks');
  }));

  it('calculates and emits value/unit changes', fakeAsync(() => {
    component.value.set(7 * ONE_DAY);
    updateView();

    element.querySelector<HTMLElement>('si-select .select')?.click();
    tick();
    fixture.detectChanges();
    document.querySelector<HTMLElement>('.dropdown-menu [data-id=weeks]')?.click();
    updateView();

    inputAction('.inc');
    updateView();

    expect(inputValue()).toBe(2);
    expect(component.value()).toBe(14 * ONE_DAY);
  }));

  it('handles time selection', fakeAsync(() => {
    component.enableTimeSelection = true;
    updateView();

    element.querySelector<HTMLElement>('si-select .select')?.click();
    updateView();

    expect(document.querySelector<HTMLElement>('.dropdown-menu [data-id=minutes]')).toBeTruthy();
  }));
});
