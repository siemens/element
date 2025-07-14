/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { SiTimepickerComponent as TestComponent } from './index';

describe('SiTimepickerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let componentRef: ComponentRef<TestComponent>;
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
    e.dispatchEvent(new Event('change'));
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  const generateKeyEvent = (key: 'ArrowDown' | 'ArrowUp'): KeyboardEvent => {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'key', { value: key });
    return event;
  };

  it('should have a default empty default value with hours and minutes configuration', () => {
    expect(getHours().value).toEqual('');
    expect(getMinutes().value).toEqual('');
    expect(getSeconds()).toBeNull();
    expect(getMilliseconds()).toBeNull();
  });

  it('should display seconds and milliseconds input', fakeAsync(() => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    fixture.detectChanges();

    expect(getHours().value).toEqual('');
    expect(getMinutes().value).toEqual('');
    expect(getSeconds().value).toEqual('');
    expect(getMilliseconds().value).toEqual('');
  }));

  it('should display time components in input elements', () => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    component.writeValue(new Date('2022-01-12 16:23'));
    fixture.detectChanges();

    expect(getHours().value).toEqual('04');
    expect(getMinutes().value).toEqual('23');
    expect(getSeconds().value).toEqual('00');
    expect(getMilliseconds().value).toEqual('000');
  });

  it('should display time in 24 hours mode with date object input', fakeAsync(() => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    componentRef.setInput('showMeridian', false);
    fixture.detectChanges();
    component.writeValue(new Date('2022-01-12 16:23:59.435'));
    fixture.detectChanges();

    expect(getHours().value).toEqual('16');
    expect(getMinutes().value).toEqual('23');
    expect(getSeconds().value).toEqual('59');
    expect(getMilliseconds().value).toEqual('435');
  }));

  it('should display time in 24 hours mode with string object input', fakeAsync(() => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    componentRef.setInput('showMinutes', true);
    componentRef.setInput('showMeridian', false);
    fixture.detectChanges();
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();

    expect(getHours().value).toEqual('16');
    expect(getMinutes().value).toEqual('23');
    expect(getSeconds().value).toEqual('59');
    expect(getMilliseconds().value).toEqual('435');
  }));

  it('should remove time components when setting undefined time', () => {
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();
    expect(getHours().value).toEqual('04');

    component.writeValue();
    fixture.detectChanges();
    expect(getHours().value).toEqual('');
  });

  it('should not change time components when setting wrong time string', () => {
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();
    expect(getHours().value).toEqual('04');

    component.writeValue('invalid');
    fixture.detectChanges();
    expect(getHours().value).toEqual('04');
  });

  it('should update time on ui changes', () => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    const spyOnChange = spyOn<any>(component, 'onChange');
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();

    expect(getHours().value).toEqual('04');
    enterValue(getHours(), '03');
    expect(spyOnChange).toHaveBeenCalled();

    enterValue(getMinutes(), '03');
    expect(spyOnChange).toHaveBeenCalled();

    enterValue(getSeconds(), '06');
    expect(spyOnChange).toHaveBeenCalled();

    enterValue(getMilliseconds(), '999');
    expect(spyOnChange).toHaveBeenCalled();
  });

  it('should determine the meridian', () => {
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();

    expect(component.isPM()).toBeTrue();

    component.writeValue('2022-01-12 04:23:59.435');
    fixture.detectChanges();
    expect(component.isPM()).toBeFalse();
  });

  it('should falsify isPM when meridian is hidden', () => {
    fixture.detectChanges();
    component.writeValue('2022-01-12 16:23:59.435');
    fixture.detectChanges();
    expect(component.isPM()).toBeTrue();

    componentRef.setInput('showMeridian', false);
    fixture.detectChanges();
    expect(component.isPM()).toBeFalse();
  });

  it('should validate time limit against min value', fakeAsync(() => {
    componentRef.setInput('min', new Date('2022-01-12 16:23:59.435'));
    fixture.detectChanges();
    component.writeValue('2021-01-12 10:23:59.435');
    fixture.detectChanges();
    expect(getHours().classList).toContain('is-invalid');
  }));

  it('should validate time limit against max value', fakeAsync(() => {
    componentRef.setInput('max', new Date('2022-01-12 16:23:59.435'));
    fixture.detectChanges();
    component.writeValue('2021-01-12 18:23:59.435');
    fixture.detectChanges();
    expect(getHours().classList).toContain('is-invalid');
  }));

  it('should update invalidHours to true if value is invalid', () => {
    componentRef.setInput('max', new Date('2022-01-12 16:23:59.435'));
    component.writeValue('2021-01-12 18:23:59.435');
    fixture.detectChanges();

    enterValue(getHours(), '19');
    expect(getHours().classList).toContain('is-invalid');
  });

  it('should update invalidMinutes to true if value is invalid', () => {
    componentRef.setInput('max', new Date('2022-01-12 16:23:59.435'));
    component.writeValue('2021-01-12 18:23:59.435');
    fixture.detectChanges();

    enterValue(getMinutes(), '24');
    fixture.detectChanges();
    expect(getMinutes().classList).toContain('is-invalid');
  });

  it('should update invalidSeconds to true if value is invalid', () => {
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('max', new Date('2022-01-12 16:23:58.435'));
    component.writeValue('2021-01-12 18:23:58.435');
    fixture.detectChanges();

    enterValue(getSeconds(), '59');
    fixture.detectChanges();
    expect(getSeconds().classList).toContain('is-invalid');
  });

  it('should update invalidMilliseconds to true if value is invalid', () => {
    componentRef.setInput('showMilliseconds', true);
    componentRef.setInput('max', new Date('2022-01-12 16:23:58.435'));
    component.writeValue('2021-01-12 18:23:58.435');
    fixture.detectChanges();

    enterValue(getMilliseconds(), '500');
    fixture.detectChanges();
    expect(getMilliseconds().classList).toContain('is-invalid');
  });

  it('should disable component', fakeAsync(() => {
    fixture.detectChanges();
    component.writeValue('2021-01-12 18:23:58.435');
    componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(getHours().disabled).toBeTruthy();
    expect(getMinutes().disabled).toBeTruthy();
  }));

  it('should toggle meridian', () => {
    component.writeValue('2021-01-12 18:23:58.435');
    fixture.detectChanges();
    const select = element.querySelector<HTMLSelectElement>('select');
    const currentMeridian = select?.value;
    select?.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(select?.value).not.toBe(currentMeridian);
  });

  it('should not show meridian', () => {
    component.writeValue('2021-01-12 18:23:58.435');
    componentRef.setInput('showMeridian', false);
    fixture.detectChanges();

    expect(element.querySelector<HTMLSelectElement>('select')).toBeFalsy();
  });

  it('should update time using up and down keys', () => {
    component.writeValue('2021-01-12 5:23:58.435');
    componentRef.setInput('showMinutes', true);
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
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
    component.writeValue('2023-01-01 11:00:59.123');
    componentRef.setInput('readonly', true);
    componentRef.setInput('showMinutes', true);
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
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
    componentRef.setInput('showMinutes', true);
    componentRef.setInput('showSeconds', true);
    componentRef.setInput('showMilliseconds', true);
    componentRef.setInput('showMeridian', false);
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

    const spyInputCompleted = spyOn(component.inputCompleted, 'emit');
    getMilliseconds().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(spyInputCompleted).toHaveBeenCalled();
  });
});
