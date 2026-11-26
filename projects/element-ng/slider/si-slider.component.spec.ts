/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { page, userEvent } from 'vitest/browser';

import { SiSliderComponent } from './si-slider.component';

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiSliderComponent],
  template: `<si-slider
    [min]="min()"
    [max]="max()"
    [step]="step()"
    [thumbIcon]="thumbIcon()"
    [(value)]="value"
    (valueChange)="sliderChanged($event)"
  />`,
  styles: `
    :host {
      display: block;
      width: 300px;
    }
  `
})
class HostComponent {
  readonly value = signal<number | undefined>(10);
  readonly step = signal(1);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly thumbIcon = signal<string | undefined>(undefined);
  sliderChanged = (value: number | undefined): void => {};
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiSliderComponent],
  template: `<form [formGroup]="form">
    <si-slider formControlName="slider" />
  </form>`
})
class FormHostComponent {
  readonly form: FormGroup;
  constructor() {
    const formBuilder = inject(FormBuilder);
    this.form = formBuilder.group({ slider: 10 });
  }
}

describe('SiSliderComponent', () => {
  let element: HTMLElement;

  const fakeClick = (target: string, ticks?: number): void => {
    const button = element.querySelector(target);
    button!.dispatchEvent(new MouseEvent('mousedown'));
    if (ticks) {
      vi.advanceTimersByTime(ticks);
    }
    button!.dispatchEvent(new MouseEvent('mouseup'));
  };

  const getValueIndicator = (): HTMLSpanElement =>
    element.querySelector<HTMLSpanElement>('span.value-indicator')!;
  const getSliderInput = (): HTMLInputElement =>
    element.querySelector<HTMLInputElement>('input[type="range"]')!;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        SiSliderComponent,
        FormHostComponent,
        HostComponent
      ]
    }).compileComponents()
  );

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('direct usage', () => {
    let fixture: ComponentFixture<HostComponent>;
    let component: HostComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should support short press increments', async () => {
      component.value.set(50);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(spy).toHaveBeenCalledWith(51);
    });

    it('should increment with step precision', async () => {
      // without adjustments in slider: 2.2 + 0.1 = 2.3000000000000003
      component.step.set(0.1);
      component.value.set(2.2);
      await fixture.whenStable();

      fakeClick('.increment-button');
      expect(component.value()).toBe(2.3);
    });

    it('should support long press increments', async () => {
      vi.useFakeTimers();
      component.value.set(50);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.increment-button', 2500);
      expect(spy.mock.calls.length).toBeGreaterThan(8);
      expect(spy.mock.lastCall![0]).toBeGreaterThan(55);
    });

    it('should support short press decrements', async () => {
      component.value.set(50);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(spy).toHaveBeenCalledWith(49);
    });

    it('should decrement with step precision', async () => {
      // without adjustments in slider: 5.9 - 0.1 = 5.800000000000001
      component.step.set(0.1);
      component.value.set(5.9);
      await fixture.whenStable();

      fakeClick('.decrement-button');
      expect(component.value()).toBe(5.8);
    });

    it('should support long press decrements', async () => {
      vi.useFakeTimers();
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button', 2500);
      expect(spy.mock.calls.length).toBeGreaterThan(8);
      expect(spy.mock.lastCall![0]).toBeLessThan(45);
    });

    it('should support upper default limit', async () => {
      component.value.set(100);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(spy).not.toHaveBeenCalledWith(100);
    });

    it('should not go beyond upper limit', async () => {
      component.value.set(200);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');
      expect(getValueIndicator().style.insetInlineStart).toBe('100%');
      expect(getSliderInput().value).toBe('100');

      fakeClick('.decrement-button');
      expect(spy).toHaveBeenCalledWith(100);
    });

    it('should support upper custom limit', async () => {
      component.max.set(2020);
      component.value.set(2020);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(spy).not.toHaveBeenCalledWith(2020);
    });

    it('should support lower default limit', async () => {
      component.value.set(0);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(spy).not.toHaveBeenCalledWith(0);
    });

    it('should not go beyond lower limit', async () => {
      component.value.set(-10);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');
      expect(getValueIndicator().style.insetInlineStart).toBe('0%');
      expect(getSliderInput().value).toBe('0');

      fakeClick('.decrement-button');
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should support lower custom limit', async () => {
      component.min.set(-2020);
      component.value.set(-2020);
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(spy).not.toHaveBeenCalledWith(-2020);
    });

    it('should update on range input event', async () => {
      await fixture.whenStable();
      using spy = vi.spyOn(component, 'sliderChanged');

      const input = getSliderInput();
      input.value = '42';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();

      expect(component.value()).toBe(42);
      expect(spy).toHaveBeenCalledWith(42);
    });

    it('should update with arrow keys', async () => {
      await fixture.whenStable();
      const slider = page.elementLocator(element).getByRole('slider');
      await userEvent.click(slider);
      // Clicking centers the slider or focuses it; reset value to a known baseline
      component.value.set(10);
      await fixture.whenStable();

      await userEvent.keyboard('{ArrowLeft}');
      await fixture.whenStable();
      expect(component.value()).toBe(9);

      await userEvent.keyboard('{ArrowRight}');
      await fixture.whenStable();
      expect(component.value()).toBe(10);
    });

    it('should handle undefined value on init', async () => {
      component.value.set(undefined);
      await fixture.whenStable();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getSliderInput().value).toBe('50');
    });

    it('should handle undefined value on change', async () => {
      component.value.set(10);
      await fixture.whenStable();
      expect(getValueIndicator().style.insetInlineStart).toBe('10%');
      expect(getSliderInput().value).toBe('10');

      component.value.set(undefined);
      await fixture.whenStable();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getSliderInput().value).toBe('50');
    });

    it('should handle invalid min/max by disabling itself', async () => {
      component.min.set(42);
      component.max.set(42);
      await fixture.whenStable();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getSliderInput().disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.decrement-button')?.disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.increment-button')?.disabled).toBe(true);
    });

    it('should position thumb icon aligned with snapped slider value', async () => {
      component.step.set(10);
      component.value.set(85);
      component.thumbIcon.set('element-temperature');
      await fixture.whenStable();

      const thumbIcon = element.querySelector<HTMLElement>('.thumb-icon')!;
      expect(thumbIcon).toBeTruthy();
      expect(thumbIcon.style.insetInlineStart).toBe('90%');
      expect(getSliderInput().value).toBe('90');
    });
  });

  describe('as form control', () => {
    let fixture: ComponentFixture<FormHostComponent>;
    let component: FormHostComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(FormHostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should set the initial value', async () => {
      await fixture.whenStable();
      expect(getValueIndicator().style.insetInlineStart).toBe('10%');
      expect(getSliderInput().value).toBe('10');
    });

    it('marks component as touched', async () => {
      await fixture.whenStable();

      fakeClick('.decrement-button');
      await fixture.whenStable();
      expect(component.form.controls.slider.touched).toBe(true);
    });

    it('marks component as touched on blur', async () => {
      await fixture.whenStable();

      getSliderInput().dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(component.form.controls.slider.touched).toBe(true);
    });

    it('updates the value in the form', async () => {
      await fixture.whenStable();

      fakeClick('.decrement-button');
      await fixture.whenStable();
      expect(component.form.controls.slider.value).toBe(9);
    });

    it('sets the disabled state', async () => {
      component.form.controls.slider.disable();
      await fixture.whenStable();

      expect(getSliderInput().disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.decrement-button')?.disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.increment-button')?.disabled).toBe(true);
    });

    it('should handle undefined value on change', async () => {
      component.form.controls.slider.setValue(undefined);
      await fixture.whenStable();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getSliderInput().value).toBe('50');
    });
  });
});
