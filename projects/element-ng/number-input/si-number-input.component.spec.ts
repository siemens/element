/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  inject,
  inputBinding,
  outputBinding,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SiNumberInputComponent } from './si-number-input.component';

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiNumberInputComponent],
  template: `<form [formGroup]="form">
    <si-number-input
      #input
      formControlName="input"
      [required]="required()"
      [min]="min()"
      [max]="max()"
    />
  </form>`
})
class FormHostComponent {
  readonly required = signal(false);
  readonly min = signal<number | undefined>(undefined);
  readonly max = signal<number | undefined>(undefined);
  readonly form = inject(FormBuilder).group({ input: 10 });
  readonly input = viewChild.required<SiNumberInputComponent>('input');
}

@Component({
  imports: [SiNumberInputComponent],
  template: ` <si-number-input min="some text" max="100" />`
})
class AttributeComponent {
  readonly siNumberInput = viewChild.required(SiNumberInputComponent);
}

describe('SiNumberInputComponent', () => {
  let element: HTMLElement;

  const fakeClick = (target: string, ticks?: number): void => {
    const button = element.querySelector(target);
    button!.dispatchEvent(new MouseEvent('mousedown'));
    if (ticks) {
      vi.advanceTimersByTime(ticks);
    }
    button!.dispatchEvent(new MouseEvent('mouseup'));
  };

  const incButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.inc');
  const decButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.dec');
  const numberValue = (): number | undefined =>
    element.querySelector<HTMLInputElement>('input')?.valueAsNumber;

  describe('direct usage', () => {
    let fixture: ComponentFixture<SiNumberInputComponent>;
    let value: WritableSignal<number | undefined>;
    let step: WritableSignal<number | 'any'>;
    let min: WritableSignal<number | undefined>;
    let max: WritableSignal<number | undefined>;
    let placeholder: WritableSignal<string | undefined>;
    let valueChangeSpy = vi.fn();

    beforeEach(() => {
      value = signal<number | undefined>(10);
      step = signal<number | 'any'>(1);
      min = signal<number | undefined>(0);
      max = signal<number | undefined>(100);
      placeholder = signal<string | undefined>(undefined);
      valueChangeSpy = vi.fn();

      fixture = TestBed.createComponent(SiNumberInputComponent, {
        bindings: [
          inputBinding('value', value),
          inputBinding('step', step),
          inputBinding('min', min),
          inputBinding('max', max),
          inputBinding('placeholder', placeholder),
          outputBinding<number | undefined>('valueChange', valueChangeSpy)
        ]
      });
      element = fixture.nativeElement;
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should support short press increments', async () => {
      value.set(50);
      await fixture.whenStable();

      fakeClick('.inc');
      expect(valueChangeSpy).toHaveBeenCalledWith(51);
    });

    it('should increment with step precision', async () => {
      // without adjustments in component: 2.2 + 0.1 = 2.3000000000000003
      step.set(0.1);
      value.set(2.2);
      await fixture.whenStable();

      fakeClick('.inc');
      expect(valueChangeSpy).toHaveBeenCalledWith(2.3);
    });

    it('should support long press increments', async () => {
      value.set(50);
      await fixture.whenStable();
      vi.useFakeTimers();
      fakeClick('.inc', 2500);
      expect(valueChangeSpy.mock.calls.length).toBeGreaterThan(8);
      expect(valueChangeSpy.mock.calls.at(-1)![0]).toBeGreaterThan(55);
      vi.useRealTimers();
    });

    it('should support short press decrements', async () => {
      value.set(50);
      await fixture.whenStable();

      fakeClick('.dec');
      expect(valueChangeSpy).toHaveBeenCalledWith(49);
    });

    it('should decrement with step precision', async () => {
      // without adjustments in component: 5.9 - 0.1 = 5.800000000000001
      step.set(0.1);
      value.set(5.9);
      await fixture.whenStable();

      fakeClick('.dec');
      expect(valueChangeSpy).toHaveBeenCalledWith(5.8);
    });

    it('should support long press decrements', async () => {
      await fixture.whenStable();
      vi.useFakeTimers();
      fakeClick('.dec', 2500);
      expect(valueChangeSpy.mock.calls.length).toBeGreaterThan(8);
      expect(valueChangeSpy.mock.lastCall![0]).toBeLessThan(5);
      vi.useRealTimers();
    });

    it('should not go beyond upper limit', async () => {
      value.set(200);
      await fixture.whenStable();

      expect(incButton()).toBeDisabled();
    });

    it('should support upper custom limit', async () => {
      max.set(200);
      value.set(150);
      await fixture.whenStable();

      fakeClick('.inc');
      expect(valueChangeSpy).toHaveBeenCalledWith(151);
    });

    it('should not allow to decrement when lower limit is reached', async () => {
      value.set(-10);
      await fixture.whenStable();

      expect(decButton()).toBeDisabled();
    });

    it('should support lower custom limit', async () => {
      min.set(-200);
      value.set(-150);
      await fixture.whenStable();

      expect(decButton()).toBeEnabled();
      fakeClick('.dec');
      expect(valueChangeSpy).toHaveBeenCalledWith(-151);
    });

    it('should update value and min correctly', async () => {
      min.set(10);
      value.set(10);
      await fixture.whenStable();

      expect(decButton()).toBeDisabled();
      expect(numberValue()).toBe(10);
    });

    it('should display placeholder text', async () => {
      placeholder.set('Placeholder');
      value.set(undefined);
      fixture.detectChanges();

      expect(element.querySelector('input')!.placeholder).toBe('Placeholder');
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
      expect(numberValue()).toBe(10);
    });

    it('marks component as touched', async () => {
      await fixture.whenStable();

      fakeClick('.dec');

      expect(component.form.controls.input.touched).toBe(true);
    });

    it('updates the value in the form', async () => {
      await fixture.whenStable();

      fakeClick('.dec');

      expect(component.form.controls.input.value).toBe(9);
    });

    it('should invalidate with max', async () => {
      component.form.controls.input.setValue(2);
      component.max.set(1);
      await fixture.whenStable();

      expect(component.form.controls.input.errors).toEqual({ max: { max: 1, actual: 2 } });

      component.max.set(2);
      await fixture.whenStable();

      expect(component.form.controls.input.errors).toBeNull();
    });

    it('should invalidate with min', async () => {
      component.form.controls.input.setValue(-1);
      component.min.set(0);
      await fixture.whenStable();

      expect(component.form.controls.input.errors).toEqual({ min: { min: 0, actual: -1 } });

      component.min.set(-1);
      await fixture.whenStable();

      expect(component.form.controls.input.errors).toBeNull();
    });

    it('should invalidate with required', async () => {
      component.form.controls.input.setValue(null);
      component.required.set(true);
      await fixture.whenStable();

      expect(component.form.controls.input.errors).toEqual({ required: true });
    });

    describe('sets the disabled state', () => {
      let numberInput: HTMLElement;

      beforeEach(async () => {
        component.form.disable();
        fixture.detectChanges();
        await fixture.whenStable();
        numberInput = element.querySelector<HTMLElement>('si-number-input')!;
      });

      it('should have class disabled', async () => {
        expect(numberInput).toHaveClass('disabled');
      });

      it('should have attribute disabled on input', () => {
        const input = numberInput.querySelector<HTMLInputElement>('input[type="number"]');
        expect(input).toBeTruthy();
        expect(input!.getAttribute('disabled')).toBeDefined();
      });
    });
  });

  describe('with attributes', () => {
    let fixture: ComponentFixture<AttributeComponent>;
    let component: AttributeComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(AttributeComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should set max attribute', () => {
      fixture.detectChanges();
      expect(component.siNumberInput().inputElement().nativeElement).toHaveAttribute('max', '100');
    });

    it('should ignore min if it is not a number', () => {
      fixture.detectChanges();
      expect(component.siNumberInput().inputElement().nativeElement).not.toHaveAttribute('min');
      expect(component.siNumberInput().inputElement().nativeElement).toHaveAttribute('max', '100');
    });
  });
});
