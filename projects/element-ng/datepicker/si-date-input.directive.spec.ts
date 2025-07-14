/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';

import { dispatchEvents, enterValue } from './components/test-helper.spec';
import { SiDateInputDirective } from './si-date-input.directive';
import { DatepickerInputConfig } from './si-datepicker.model';
import { SiDatepickerModule } from './si-datepicker.module';

@Component({
  imports: [SiDatepickerModule, FormsModule],
  template: `<input
    #siDateInput
    #validation="ngModel"
    type="text"
    placeholder="siDateInput"
    class="form-control"
    siDateInput
    [disabled]="disabled()"
    [siDatepickerConfig]="config()"
    [ngModel]="date"
    (ngModelChange)="onModelChange($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly siDateInput = viewChild.required<ElementRef>('siDateInput');
  readonly validation = viewChild.required<NgControl>('validation');
  readonly siDateInputDirective = viewChild.required(SiDateInputDirective);
  date: Date | string = new Date('2022-03-12');
  readonly disabled = signal<boolean | undefined>(undefined);
  readonly config = signal<DatepickerInputConfig>({
    showTime: true,
    disabledTime: false
  });
  onModelChange(d: Date): void {}
}

describe('SiDateInputDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let element: HTMLElement;

  /** Update datepicker configuration */
  const updateConfig = async (c: DatepickerInputConfig): Promise<void> => {
    component.config.set(c);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const dateInput = (): HTMLInputElement => element.querySelector<HTMLInputElement>('input')!;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const getTestDate = (): Date => {
    const dateTime = new Date();
    dateTime.setDate(12);
    dateTime.setMonth(2); // starts with 0
    dateTime.setFullYear(2022);
    dateTime.setHours(5);
    dateTime.setMinutes(30);
    dateTime.setSeconds(20);
    return dateTime; // 12/03/2022, 5:30:20 AM
  };

  it('should consider short time format', async () => {
    component.date = getTestDate();
    updateConfig({
      showTime: true,
      dateTimeFormat: 'dd.MM.yyyy, HH:mm'
    });
    dispatchEvents(dateInput(), ['focus', 'input']);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.siDateInput().nativeElement.value).toBe('12.03.2022, 05:30');
  });

  it('should consider default time format if showSeconds true', async () => {
    component.date = getTestDate();
    updateConfig({
      showTime: true,
      showSeconds: true
    });
    dispatchEvents(dateInput(), ['focus', 'change']);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.siDateInput().nativeElement.value).toBe('3/12/2022, 5:30:20 AM');
  });

  it('should consider minDate criteria with time', fakeAsync(() => {
    spyOn(component.siDateInputDirective(), 'validate').and.callThrough();
    component.date = new Date('2020-03-12T13:13:13');
    updateConfig({
      showTime: true,
      showSeconds: true,
      minDate: new Date('2021-03-12T13:13:12')
    });
    dispatchEvents(dateInput(), ['focus', 'change']);

    tick();

    expect(component.validation().errors?.minDate).toEqual({
      actual: component.date,
      min: component.config().minDate
    });
    flush();
  }));

  it('should consider minDate criteria only date', fakeAsync(() => {
    spyOn(component.siDateInputDirective(), 'validate').and.callThrough();
    component.date = new Date('2020-03-12');
    updateConfig({
      showTime: true,
      showSeconds: true,
      minDate: new Date('2021-03-13')
    });
    dispatchEvents(dateInput(), ['focus', 'change']);

    tick();

    expect(component.validation().errors?.minDate).toEqual({
      actual: component.date,
      min: component.config().minDate
    });
    flush();
  }));

  it('should consider maxDate criteria with time', fakeAsync(() => {
    spyOn(component.siDateInputDirective(), 'validate').and.callThrough();
    component.date = new Date('2024-03-12T13:13:13');
    updateConfig({
      showTime: true,
      showSeconds: true,
      maxDate: new Date('2023-03-12T13:13:12')
    });
    dispatchEvents(dateInput(), ['focus', 'change']);

    tick();
    expect(component.validation().errors?.maxDate).toEqual({
      actual: component.date,
      max: component.config().maxDate
    });
    flush();
  }));

  it('should consider maxDate criteria only date', fakeAsync(() => {
    spyOn(component.siDateInputDirective(), 'validate').and.callThrough();
    component.date = new Date('2024-03-12');
    updateConfig({
      showTime: true,
      showSeconds: true,
      maxDate: new Date('2023-03-11')
    });
    dispatchEvents(dateInput(), ['focus', 'change']);

    tick();
    expect(component.validation().errors?.maxDate).toEqual({
      actual: component.date,
      max: component.config().maxDate
    });
    flush();
  }));

  it('should disable input element when setting disabled property to true', fakeAsync(() => {
    expect(component.siDateInputDirective().disabled()).toBe(false);
    expect(dateInput().disabled).toBe(false);

    component.disabled.set(true);
    fixture.detectChanges();
    expect(dateInput().disabled).toBe(true);
  }));

  it('should trigger modelChange with undefined when input is blank string', async () => {
    // In case user remove the date string this should be reflected in the datepicker
    const spy = spyOn<any>(component.siDateInputDirective(), 'onModelChange').and.callThrough();
    enterValue(dateInput(), '   ');

    fixture.detectChanges();
    await fixture.whenStable();
    expect((spy.calls.mostRecent().args[0]! as Date).getTime()).toBeNaN();
  });

  it('should update displayed value when config changes', async () => {
    component.date = getTestDate();

    await updateConfig({ showTime: true });
    fixture.detectChanges();

    expect(component.siDateInput().nativeElement.value).toBe('3/12/2022, 5:30 AM');

    await updateConfig({ showTime: true, dateTimeFormat: 'dd.MM.yyyy, HH:mm' });
    fixture.detectChanges();

    expect(component.siDateInput().nativeElement.value).toBe('12.03.2022, 05:30');

    await updateConfig({ showTime: false, dateFormat: 'dd.MM.yyyy' });
    fixture.detectChanges();

    expect(component.siDateInput().nativeElement.value).toBe('12.03.2022');
  });
});
