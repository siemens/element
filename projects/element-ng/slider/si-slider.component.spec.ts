/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SiSliderComponent } from './si-slider.component';

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiSliderComponent],
  template: `<si-slider
    [min]="min"
    [max]="max"
    [step]="step"
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
  step = 1;
  min = 0;
  max = 100;
  sliderChanged = (value: number): void => {};
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
      jasmine.clock().tick(ticks);
    }
    button!.dispatchEvent(new MouseEvent('mouseup'));
  };

  const getValueIndicator = (): HTMLSpanElement =>
    element.querySelector<HTMLSpanElement>('span.value-indicator')!;
  const getThumbHandle = (): HTMLDivElement =>
    element.querySelector<HTMLDivElement>('div.thumb-handle')!;

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

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
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
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(component.sliderChanged).toHaveBeenCalledWith(51);
    });

    it('should increment with step precision', async () => {
      // without adjustments in slider: 2.2 + 0.1 = 2.3000000000000003
      component.step = 0.1;
      component.value.set(2.2);
      fixture.detectChanges();
      await fixture.whenStable();

      fakeClick('.increment-button');
      expect(component.value()).toBe(2.3);
    });

    it('should support long press increments', async () => {
      component.value.set(50);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.increment-button', 2500);
      const spy = component.sliderChanged as jasmine.Spy;
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args).toBeGreaterThan(55);
    });

    it('should support short press decrements', async () => {
      component.value.set(50);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(component.sliderChanged).toHaveBeenCalledWith(49);
    });

    it('should decrement with step precision', async () => {
      // without adjustments in slider: 5.9 - 0.1 = 5.800000000000001
      component.step = 0.1;
      component.value.set(5.9);
      fixture.detectChanges();
      await fixture.whenStable();

      fakeClick('.decrement-button');
      expect(component.value()).toBe(5.8);
    });

    it('should support long press decrements', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button', 2500);
      const spy = component.sliderChanged as jasmine.Spy;
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args[0]).toBeLessThan(45);
    });

    it('should support upper default limit', async () => {
      component.value.set(100);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(component.sliderChanged).not.toHaveBeenCalledWith(100);
    });

    it('should not go beyond upper limit', async () => {
      component.value.set(200);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');
      expect(getValueIndicator().style.insetInlineStart).toBe('100%');
      expect(getThumbHandle().style.insetInlineStart).toBe('100%');

      fakeClick('.decrement-button');
      expect(component.sliderChanged).toHaveBeenCalledWith(100);
    });

    it('should support upper custom limit', async () => {
      component.max = 2020;
      component.value.set(2020);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.increment-button');
      expect(component.sliderChanged).not.toHaveBeenCalledWith(2020);
    });

    it('should support lower default limit', async () => {
      component.value.set(0);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(component.sliderChanged).not.toHaveBeenCalledWith(0);
    });

    it('should not go beyond lower limit', async () => {
      component.value.set(-10);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');
      expect(getValueIndicator().style.insetInlineStart).toBe('0%');
      expect(getThumbHandle().style.insetInlineStart).toBe('0%');

      fakeClick('.decrement-button');
      expect(component.sliderChanged).toHaveBeenCalledWith(0);
    });

    it('should support lower custom limit', async () => {
      component.min = -2020;
      component.value.set(-2020);
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(component, 'sliderChanged');

      fakeClick('.decrement-button');
      expect(component.sliderChanged).not.toHaveBeenCalledWith(-2020);
    });

    it('should update on drag element move with mouse', () => {
      fixture.detectChanges();
      element
        .querySelector('.thumb-handle')!
        .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 68 }));
      element
        .querySelector('.thumb-handle')!
        .dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 60 }));
      element
        .querySelector('.thumb-handle')!
        .dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      fixture.detectChanges();
      expect(component.value()).toBe(6);
    });

    if ('TouchEvent' in window) {
      it('should update on drag element move with touch', () => {
        const handle = element.querySelector('.thumb-handle')!;
        fixture.detectChanges();
        handle!.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            touches: [new Touch({ clientX: 68, identifier: 0, target: handle })]
          })
        );
        handle.dispatchEvent(
          new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({ clientX: 76, identifier: 0, target: handle })]
          })
        );
        handle.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(14);
      });
    }

    it('should update with arrow keys', () => {
      const handle = element.querySelector('.thumb')!;
      fixture.detectChanges();
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      handle.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
      fixture.detectChanges();
      expect(component.value()).toBe(9);
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      handle.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
      fixture.detectChanges();
      expect(component.value()).toBe(10);
    });

    it('should handle undefined value on init', () => {
      component.value.set(undefined);
      fixture.detectChanges();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getThumbHandle().style.insetInlineStart).toBe('50%');
    });

    it('should handle undefined value on change', () => {
      component.value.set(10);
      fixture.detectChanges();
      expect(getValueIndicator().style.insetInlineStart).toBe('10%');
      expect(getThumbHandle().style.insetInlineStart).toBe('10%');

      component.value.set(undefined);
      fixture.detectChanges();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getThumbHandle().style.insetInlineStart).toBe('50%');
    });

    it('should handle invalid min/max by disabling itself', () => {
      component.min = 42;
      component.max = 42;
      fixture.detectChanges();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getThumbHandle().style.insetInlineStart).toBe('50%');
      expect(element.querySelector<HTMLButtonElement>('.decrement-button')?.disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.increment-button')?.disabled).toBe(true);
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

    it('should set the initial value', () => {
      fixture.detectChanges();
      expect(getValueIndicator().style.insetInlineStart).toBe('10%');
    });

    it('marks component as touched', async () => {
      fixture.detectChanges();

      fakeClick('.decrement-button');
      await fixture.whenStable();
      expect(component.form.controls.slider.touched).toBe(true);
    });

    it('updates the value in the form', async () => {
      fixture.detectChanges();

      fakeClick('.decrement-button');
      await fixture.whenStable();
      expect(component.form.controls.slider.value).toBe(9);
    });

    it('sets the disabled state', async () => {
      component.form.controls.slider.disable();
      fixture.detectChanges();

      expect(element.querySelector<HTMLButtonElement>('.decrement-button')?.disabled).toBe(true);
      expect(element.querySelector<HTMLButtonElement>('.increment-button')?.disabled).toBe(true);
    });

    it('should handle undefined value on change', () => {
      component.form.controls.slider.setValue(undefined);
      fixture.detectChanges();

      expect(getValueIndicator().style.insetInlineStart).toBe('50%');
      expect(getThumbHandle().style.insetInlineStart).toBe('50%');
    });
  });
});
