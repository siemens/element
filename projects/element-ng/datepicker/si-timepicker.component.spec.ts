/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SiTimepickerComponent as TestComponent } from './index';

@Component({
  imports: [TestComponent, ReactiveFormsModule],
  template: `
    <si-timepicker
      [disabled]="disabled()"
      [formControl]="time"
      [min]="min()"
      [max]="max()"
      [readonly]="readonly()"
      [showMinutes]="showMinutes()"
      [showSeconds]="showSeconds()"
      [showMilliseconds]="showMilliseconds()"
      [showMeridian]="showMeridian()"
      (inputCompleted)="onInputCompleted()"
    />
  `
})
class WrapperComponent {
  readonly picker = viewChild.required<TestComponent>(TestComponent);
  readonly disabled = signal(false);
  readonly time = new FormControl<Date | string | undefined>(undefined);
  readonly readonly = signal(false);
  readonly showMinutes = signal(true);
  readonly showSeconds = signal(false);
  readonly showMilliseconds = signal(false);
  readonly showMeridian = signal(true);
  readonly min = signal<Date | undefined>(undefined);
  readonly max = signal<Date | undefined>(undefined);
  onInputCompleted = (): void => {};
}

describe('SiTimepickerComponent', () => {
  let element: HTMLElement;

  const getHours = (): HTMLInputElement =>
    element.querySelector<HTMLInputElement>('input[name="hours"]')!;
  const getMinutes = (): HTMLInputElement =>
    element.querySelector<HTMLInputElement>('input[name="minutes"]')!;
  const getSeconds = (): HTMLInputElement =>
    element.querySelector<HTMLInputElement>('input[name="seconds"]')!;
  const getMilliseconds = (): HTMLInputElement =>
    element.querySelector<HTMLInputElement>('input[name="milliseconds"]')!;
  const enterValue = (e: HTMLInputElement, v: string): void => {
    e.value = v;
    e.dispatchEvent(new Event('input'));
    e.dispatchEvent(new Event('change'));
    e.dispatchEvent(new Event('blur'));
  };
  const generateKeyEvent = (key: 'ArrowDown' | 'ArrowUp'): KeyboardEvent => {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'key', { value: key });
    return event;
  };

  describe('with default configuration', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestComponent);
      element = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should have a default empty default value with hours and minutes configuration', () => {
      expect(getHours().value).toEqual('');
      expect(getMinutes().value).toEqual('');
      expect(getSeconds()).toBeNull();
      expect(getMilliseconds()).toBeNull();
    });
  });

  describe('with forms', () => {
    let fixture: ComponentFixture<WrapperComponent>;
    let component: WrapperComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(WrapperComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should display seconds and milliseconds input', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(getHours().value).toEqual('');
      expect(getMinutes().value).toEqual('');
      expect(getSeconds().value).toEqual('');
      expect(getMilliseconds().value).toEqual('');
    });

    it('should display time components in input elements', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      component.time.setValue(new Date('2022-01-12 16:23'));
      fixture.detectChanges();

      expect(getHours().value).toEqual('04');
      expect(getMinutes().value).toEqual('23');
      expect(getSeconds().value).toEqual('00');
      expect(getMilliseconds().value).toEqual('000');
    });

    it('should display time in 24 hours mode with date object input', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      component.showMeridian.set(false);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      component.time.setValue(new Date('2022-01-12 16:23:59.435'));
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(getHours().value).toEqual('16');
      expect(getMinutes().value).toEqual('23');
      expect(getSeconds().value).toEqual('59');
      expect(getMilliseconds().value).toEqual('435');
    });

    it('should display time in 24 hours mode with string object input', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      component.showMeridian.set(false);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(getHours().value).toEqual('16');
      expect(getMinutes().value).toEqual('23');
      expect(getSeconds().value).toEqual('59');
      expect(getMilliseconds().value).toEqual('435');
    });

    it('should remove time components when setting undefined time', () => {
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.detectChanges();
      expect(getHours().value).toEqual('04');

      component.time.setValue(undefined);
      fixture.detectChanges();
      expect(getHours().value).toEqual('');
    });

    it('should not change time components when setting wrong time string', () => {
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.detectChanges();
      expect(getHours().value).toEqual('04');

      component.time.setValue('invalid');
      fixture.detectChanges();
      expect(getHours().value).toEqual('04');
    });

    it('should update time on ui changes', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.detectChanges();

      expect(getHours().value).toEqual('04');
      enterValue(getHours(), '03');
      enterValue(getMinutes(), '03');
      enterValue(getSeconds(), '06');
      enterValue(getMilliseconds(), '999');
      expect(component.time.value).toEqual(new Date('2022-01-12 15:03:06.999'));
    });

    it('should determine the meridian', () => {
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.detectChanges();

      expect(component.picker().isPM()).toBeTrue();

      component.time.setValue('2022-01-12 04:23:59.435');
      fixture.detectChanges();
      expect(component.picker().isPM()).toBeFalse();
    });

    it('should falsify isPM when meridian is hidden', () => {
      fixture.detectChanges();
      component.time.setValue('2022-01-12 16:23:59.435');
      fixture.detectChanges();
      expect(component.picker().isPM()).toBeTrue();

      component.showMeridian.set(false);
      fixture.detectChanges();
      expect(component.picker().isPM()).toBeFalse();
    });

    it('should validate hours range', () => {
      component.max.set(new Date('2022-01-12 16:23:59.435'));
      component.time.setValue('2021-01-12 18:23:59.435');
      enterValue(getHours(), '24');
      fixture.detectChanges();
      expect(component.time.errors).toEqual({ hours: { max: 12 } });
      expect(getHours().classList).toContain('ng-invalid');
    });

    it('should validate minutes range', async () => {
      component.time.setValue('2021-01-12 18:23:59.435');
      enterValue(getMinutes(), '70'); // Invalid minutes
      fixture.detectChanges();

      expect(component.time.errors).toEqual({ minutes: { max: 59 } });
      expect(getMinutes().classList).toContain('ng-invalid');
    });

    it('should validate seconds range', async () => {
      component.showSeconds.set(true);
      fixture.detectChanges();
      enterValue(getSeconds(), '70'); // Invalid seconds
      fixture.detectChanges();

      expect(component.time.errors).toEqual({ seconds: { max: 59 } });
      expect(getSeconds().classList).toContain('ng-invalid');
    });

    it('should validate max with hours', async () => {
      component.max.set(new Date('2022-01-12 16:23:58.435'));
      component.time.setValue('2021-01-12 18:23:58.435');
      fixture.detectChanges();
      enterValue(getHours(), '5');
      fixture.detectChanges();

      expect(component.time.errors).toEqual({
        maxTime: {
          actual: new Date('2021-01-12 17:23:58.435'),
          max: new Date('2021-01-12 16:23:58.435')
        }
      });
    });

    it('should validate max with milliseconds', () => {
      component.showMilliseconds.set(true);
      component.max.set(new Date('2022-01-12 16:23:58.435'));
      component.time.setValue('2021-01-12 18:23:58.435');
      fixture.detectChanges();

      enterValue(getMilliseconds(), '500');
      fixture.detectChanges();
      expect(component.time.errors).toEqual({
        maxTime: {
          actual: new Date('2021-01-12 18:23:58.500'),
          max: new Date('2021-01-12 16:23:58.435')
        }
      });
    });

    it('should validate min with hours', async () => {
      component.min.set(new Date('2022-01-12 16:23:58.435'));
      component.time.setValue('2021-01-12 18:23:58.435');
      fixture.detectChanges();

      enterValue(getHours(), '3');
      fixture.detectChanges();

      expect(component.time.errors).toEqual({
        minTime: {
          actual: new Date('2021-01-12 15:23:58.435'),
          min: new Date('2021-01-12 16:23:58.435')
        }
      });
    });

    it('should disable component', () => {
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      component.time.setValue('2021-01-12 18:23:58.435');
      component.disabled.set(true);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(getHours().disabled).toBeTruthy();
      expect(getMinutes().disabled).toBeTruthy();
    });

    it('should toggle meridian', () => {
      component.time.setValue('2021-01-12 18:23:58.435');
      fixture.detectChanges();
      const select = element.querySelector<HTMLSelectElement>('select');
      const currentMeridian = select?.value;
      select?.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(select?.value).not.toBe(currentMeridian);
    });

    it('should not toggle meridian', () => {
      component.time.setValue('2021-01-12 01:01:00.000');
      fixture.detectChanges();
      // Entering 12 am (midnight) should not toggle the meridian
      enterValue(getHours(), '12');

      fixture.detectChanges();
      const select = element.querySelector<HTMLSelectElement>('select');
      expect(select?.value).not.toBe('pm');
    });

    it('should toggle meridian when hours > 12', () => {
      component.time.setValue('2021-01-12 01:01:00.000');
      fixture.detectChanges();
      // Entering hours above 12 should toggle the meridian to PM
      enterValue(getHours(), '13');

      fixture.detectChanges();
      const select = element.querySelector<HTMLSelectElement>('select');
      expect(select?.value).toBe('pm');
    });

    it('should not show meridian', () => {
      component.time.setValue('2021-01-12 18:23:58.435');
      component.showMeridian.set(false);
      fixture.detectChanges();

      expect(element.querySelector<HTMLSelectElement>('select')).toBeFalsy();
    });

    it('should update time using up and down keys', () => {
      component.time.setValue('2021-01-12 5:23:58.435');
      component.showMinutes.set(true);
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      fixture.detectChanges();

      const hours = getHours();
      const minutes = getMinutes();
      const seconds = getSeconds();

      hours?.dispatchEvent(generateKeyEvent('ArrowDown'));
      minutes?.dispatchEvent(generateKeyEvent('ArrowDown'));
      seconds?.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();

      expect(hours.value).toBe('04');
      expect(minutes.value).toBe('22');
      expect(seconds.value).toBe('57');

      hours?.dispatchEvent(generateKeyEvent('ArrowUp'));
      minutes?.dispatchEvent(generateKeyEvent('ArrowUp'));
      seconds?.dispatchEvent(generateKeyEvent('ArrowUp'));

      fixture.detectChanges();
      expect(hours.value).toBe('05');
      expect(minutes.value).toBe('23');
      expect(seconds.value).toBe('58');
    });

    it('should not update time using up and down keys when readonly is set', () => {
      component.time.setValue('2023-01-01 11:00:59.123');
      component.readonly.set(true);
      component.showMinutes.set(true);
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      fixture.detectChanges();

      const hours = getHours();
      const minutes = getMinutes();
      const seconds = getSeconds();
      const milliSeconds = getMilliseconds();
      const meridianSelector = element.querySelector<HTMLSelectElement>('select');
      const currentMeridian = meridianSelector?.value;

      hours?.dispatchEvent(generateKeyEvent('ArrowDown'));
      minutes?.dispatchEvent(generateKeyEvent('ArrowDown'));
      seconds?.dispatchEvent(generateKeyEvent('ArrowDown'));
      milliSeconds?.dispatchEvent(generateKeyEvent('ArrowDown'));
      meridianSelector?.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();
      meridianSelector?.dispatchEvent(generateKeyEvent('ArrowDown')); // Simulate PM selection
      fixture.detectChanges();
      meridianSelector?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(hours.value).toBe('11');
      expect(minutes.value).toBe('00');
      expect(seconds.value).toBe('59');
      expect(milliSeconds.value).toBe('123');
      expect(meridianSelector?.value).toBe(currentMeridian);

      hours?.dispatchEvent(generateKeyEvent('ArrowUp'));
      minutes?.dispatchEvent(generateKeyEvent('ArrowUp'));
      seconds?.dispatchEvent(generateKeyEvent('ArrowUp'));
      milliSeconds?.dispatchEvent(generateKeyEvent('ArrowUp'));
      meridianSelector?.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();
      meridianSelector?.dispatchEvent(generateKeyEvent('ArrowDown')); // Simulate PM selection
      fixture.detectChanges();
      meridianSelector?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(hours.value).toBe('11');
      expect(minutes.value).toBe('00');
      expect(seconds.value).toBe('59');
      expect(milliSeconds.value).toBe('123');
      expect(meridianSelector?.value).toBe(currentMeridian);
    });

    it('should focus next input on Enter key and emit inputCompleted event on last', () => {
      component.showSeconds.set(true);
      component.showMilliseconds.set(true);
      component.showMeridian.set(false);
      fixture.detectChanges();

      const spyMinutes = spyOn(getMinutes(), 'focus').and.callThrough();
      getHours().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(spyMinutes).toHaveBeenCalled();

      const spySeconds = spyOn(getSeconds(), 'focus').and.callThrough();
      getMinutes().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(spySeconds).toHaveBeenCalled();

      const spyMilliseconds = spyOn(getMilliseconds(), 'focus').and.callThrough();
      getSeconds().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(spyMilliseconds).toHaveBeenCalled();

      const spyInputCompleted = spyOn(component, 'onInputCompleted');
      getMilliseconds().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(spyInputCompleted).toHaveBeenCalled();
    });

    it('should ignore non-numeric characters', () => {
      enterValue(getHours(), 'a');
      expect(getHours().value).toBe('');

      enterValue(getHours(), '1a');
      expect(getHours().value).toBe('1');
    });
  });
});
