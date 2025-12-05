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
import { SiDatepickerDirective } from '@siemens/element-ng/datepicker';
import { expect, it, vi } from 'vitest';

import { SiCalendarButtonComponent } from './si-calendar-button.component';

@Component({
  imports: [SiCalendarButtonComponent, SiDatepickerDirective],
  template: `
    <si-calendar-button class="w-100">
      <input
        class="form-control"
        type="text"
        siDatepicker
        [disabled]="disabled()"
        [readonly]="readonly()"
      />
    </si-calendar-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

describe('SiCalendarButtonComponent', () => {
  const calendarToggleButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[name="open-calendar"]');
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show datepicker overlay', async () => {
    calendarToggleButton().click();
    fixture.detectChanges();
    expect(document.querySelector('si-datepicker-overlay')).toBeTruthy();
  });

  it('should focus button when closing overlay with Escape', async () => {
    const button = calendarToggleButton();
    button.focus();
    button.click();
    fixture.detectChanges();
    const overlay = document.querySelector('si-datepicker-overlay');
    expect(overlay).toBeTruthy();

    const spy = vi.spyOn(button, 'focus');
    overlay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should mark as touched if button is blurred', () => {
    vi.useFakeTimers();
    const touchSpy = vi.spyOn(SiDatepickerDirective.prototype, 'touch');
    const button = calendarToggleButton();
    button.focus();
    button.blur();
    vi.advanceTimersByTime(0);
    expect(touchSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should use default aria label', () => {
    expect(calendarToggleButton().getAttribute('aria-label')).toBe('Open calendar');
  });

  it('should disable button when datepicker directive is disabled', async () => {
    component.disabled.set(true);
    fixture.detectChanges();

    const button = calendarToggleButton();
    expect(button.disabled).toBe(true);

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('si-datepicker-overlay')).toBeFalsy();
  });

  it('should disable button when datepicker directive is readonly', async () => {
    component.readonly.set(true);
    fixture.detectChanges();

    const button = calendarToggleButton();
    expect(button.disabled).toBe(true);

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('si-datepicker-overlay')).toBeFalsy();
  });
});
