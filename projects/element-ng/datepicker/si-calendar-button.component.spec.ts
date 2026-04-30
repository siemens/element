/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatepickerInputConfig, SiDatepickerDirective } from '@siemens/element-ng/datepicker';

import { SiCalendarButtonComponent } from './si-calendar-button.component';
import { CalendarTestHelper, enterValue } from './testing/test-helper';

@Component({
  imports: [SiCalendarButtonComponent, SiDatepickerDirective],
  template: `
    <si-calendar-button class="w-100">
      <input
        class="form-control"
        type="text"
        siDatepicker
        [siDatepickerConfig]="config()"
        [disabled]="disabled()"
        [readonly]="readonly()"
      />
    </si-calendar-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly config = signal<DatepickerInputConfig>({});
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

describe('SiCalendarButtonComponent', () => {
  const calendarToggleButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[name="open-calendar"]');
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;

  /** Update datepicker configuration */
  const updateConfig = async (c: DatepickerInputConfig): Promise<void> => {
    component.config.set(c);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vi.setSystemTime(new Date('2023-12-31'));
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show datepicker overlay', async () => {
    calendarToggleButton().click();
    fixture.detectChanges();
    expect(document.querySelector('si-datepicker-overlay')).toBeInTheDocument();
  });

  it('should focus button when closing overlay with Escape', async () => {
    const button = calendarToggleButton();
    button.focus();
    button.click();
    fixture.detectChanges();
    const overlay = document.querySelector('si-datepicker-overlay');
    expect(overlay).toBeInTheDocument();

    const spy = vi.spyOn(button, 'focus');
    overlay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should mark as touched if button is blurred', async () => {
    const touchSpy = vi.spyOn(SiDatepickerDirective.prototype, 'touch');
    const button = calendarToggleButton();
    button.focus();
    button.blur();
    await fixture.whenStable();
    expect(touchSpy).toHaveBeenCalled();
  });

  it('should use default aria label', () => {
    expect(calendarToggleButton()).toHaveAttribute('aria-label', 'Open calendar');
  });

  it('should disable button when datepicker directive is disabled', async () => {
    component.disabled.set(true);
    fixture.detectChanges();

    const button = calendarToggleButton();
    expect(button).toBeDisabled();

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('si-datepicker-overlay')).not.toBeInTheDocument();
  });

  it('should disable button when datepicker directive is readonly', async () => {
    component.readonly.set(true);
    fixture.detectChanges();

    const button = calendarToggleButton();
    expect(button).toBeDisabled();

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('si-datepicker-overlay')).not.toBeInTheDocument();
  });

  it('should update time to 12:30 AM', async () => {
    // Ensure that the current selected meridian is taken over to the datepicker input.
    // Internally the timepicker adjust the date object hours based on the meridian selection.
    const enabledTimeText = 'Consider Time';
    await updateConfig({
      ...component.config(),
      enabledTimeText,
      showTime: true,
      showMinutes: true,
      dateTimeFormat: 'MM/dd/yyyy hh:mm a'
    });
    calendarToggleButton().click();
    fixture.detectChanges();

    const datepicker = document.querySelector<HTMLElement>('si-datepicker')!;
    const helper = new CalendarTestHelper(datepicker);
    enterValue(helper.getTimeInputHours(), '12');
    enterValue(helper.getTimeInputMinutes(), '30');
    const meridian = helper.getMeridian();
    expect(meridian?.value).toBe('am');
    helper.getTimeInputMinutes().dispatchEvent(new Event('blur'));

    helper.getEnabledCellWithText('20')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.debugElement.query(By.css('input[siDatepicker]')).nativeElement;
    expect(input.value).toBe('12/20/2023 12:30 AM');
  });
});
