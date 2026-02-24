/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SiNumberInputComponent } from './si-number-input.component';

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiNumberInputComponent],
  template: `<si-number-input
    #input
    [min]="min"
    [max]="max"
    [step]="step"
    [placeholder]="placeholder"
    [(value)]="value"
    (valueChange)="valueChange($event)"
  />`
})
class HostComponent {
  value?: number = 10;
  step = 1;
  min = 0;
  max = 100;
  placeholder?: string;
  readonly input = viewChild.required<SiNumberInputComponent>('input');
  valueChange(any: number): void {}
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiNumberInputComponent],
  template: `<form [formGroup]="form">
    <si-number-input #input formControlName="input" [required]="required" [min]="min" [max]="max" />
  </form>`
})
class FormHostComponent {
  required?: boolean;
  min?: number;
  max?: number;
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
      jasmine.clock().tick(ticks);
    }
    button!.dispatchEvent(new MouseEvent('mouseup'));
  };

  const incButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.inc');
  const decButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.dec');
  const numberValue = (): number | undefined =>
    element.querySelector<HTMLInputElement>('input')?.valueAsNumber;

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        SiNumberInputComponent,
        FormHostComponent,
        HostComponent,
        AttributeComponent
      ]
    })
  );

  describe('direct usage', () => {
    let fixture: ComponentFixture<HostComponent>;
    let component: HostComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should support short press increments', () => {
      component.value = 50;
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc');
      expect(spy).toHaveBeenCalledWith(51);
    });

    it('should increment with step precision', () => {
      // without adjustments in component: 2.2 + 0.1 = 2.3000000000000003
      component.step = 0.1;
      component.value = 2.2;
      fixture.detectChanges();

      fakeClick('.inc');
      expect(component.value).toBe(2.3);
    });

    it('should support long press increments', () => {
      component.value = 50;
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc', 2500);
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args).toBeGreaterThan(55);
    });

    it('should support short press decrements', () => {
      component.value = 50;
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.dec');
      expect(spy).toHaveBeenCalledWith(49);
    });

    it('should decrement with step precision', () => {
      // without adjustments in component: 5.9 - 0.1 = 5.800000000000001
      component.step = 0.1;
      component.value = 5.9;
      fixture.detectChanges();

      fakeClick('.dec');
      expect(component.value).toBe(5.8);
    });

    it('should support long press decrements', () => {
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.dec', 2500);
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args[0]).toBeLessThan(45);
    });

    it('should not go beyond upper limit', () => {
      component.value = 200;
      fixture.detectChanges();

      expect(incButton()?.disabled).toBeTruthy();
    });

    it('should support upper custom limit', () => {
      component.max = 200;
      component.value = 150;
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc');
      expect(spy).toHaveBeenCalledWith(151);
    });

    it('should not allow to decrement when lower limit is reached', () => {
      component.value = -10;
      fixture.detectChanges();

      expect(decButton()?.disabled).toBeTruthy();
    });

    it('should support lower custom limit', () => {
      component.min = -200;
      component.value = -150;
      fixture.detectChanges();
      const spy = spyOn(component, 'valueChange');

      expect(decButton()?.disabled).toBeFalsy();
      fakeClick('.dec');
      expect(spy).toHaveBeenCalledWith(-151);
    });

    it('should update value and min correctly', () => {
      fixture.detectChanges();

      component.min = 10;
      component.value = 10;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(decButton()?.disabled).toBeTruthy();
      expect(numberValue()).toBe(10);
    });

    it('should display placeholder text', () => {
      fixture.detectChanges();

      component.placeholder = 'Placeholder';
      component.value = undefined;
      fixture.changeDetectorRef.markForCheck();
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

    it('should set the initial value', () => {
      fixture.detectChanges();
      expect(numberValue()).toBe(10);
    });

    it('marks component as touched', () => {
      fixture.detectChanges();

      fakeClick('.dec');

      expect(component.form.controls.input.touched).toBe(true);
    });

    it('updates the value in the form', () => {
      fixture.detectChanges();

      fakeClick('.dec');

      expect(component.form.controls.input.value).toBe(9);
    });

    it('should invalidate with max', () => {
      component.form.controls.input.setValue(2);
      component.max = 1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toEqual({ max: { max: 1, actual: 2 } });

      component.max = 2;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toBeNull();
    });

    it('should invalidate with min', () => {
      component.form.controls.input.setValue(-1);
      component.min = 0;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toEqual({ min: { min: 0, actual: -1 } });

      component.min = -1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toBeNull();
    });

    it('should invalidate with required', () => {
      component.form.controls.input.setValue(null);
      component.required = true;
      fixture.detectChanges();

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
        expect(numberInput.classList).toContain('disabled');
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
      expect(component.siNumberInput().inputElement().nativeElement?.getAttribute('max')).toBe(
        '100'
      );
    });

    it('should ignore min if it is not a number', () => {
      fixture.detectChanges();
      expect(
        component.siNumberInput().inputElement().nativeElement?.getAttribute('min')
      ).toBeNull();
      expect(component.siNumberInput().inputElement().nativeElement?.getAttribute('max')).toBe(
        '100'
      );
    });
  });
});
