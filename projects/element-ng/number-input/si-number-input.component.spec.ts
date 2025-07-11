/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, inject, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SiNumberInputComponent } from './si-number-input.component';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SiNumberInputComponent],
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SiNumberInputComponent],
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
  imports: [CommonModule, SiNumberInputComponent],
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
      tick(ticks);
    }
    button!.dispatchEvent(new MouseEvent('mouseup'));
  };

  const incButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.inc');
  const decButton = (): HTMLButtonElement | null =>
    element.querySelector<HTMLButtonElement>('button.dec');
  const numberValue = (): number | undefined =>
    element.querySelector<HTMLInputElement>('input')?.valueAsNumber;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
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

    it('should support short press increments', fakeAsync(() => {
      component.value = 50;
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc');
      expect(spy).toHaveBeenCalledWith(51);
    }));

    it('should increment with step precision', fakeAsync(() => {
      // without adjustments in component: 2.2 + 0.1 = 2.3000000000000003
      component.step = 0.1;
      component.value = 2.2;
      fixture.detectChanges();
      tick();

      fakeClick('.inc');
      expect(component.value).toBe(2.3);
    }));

    it('should support long press increments', fakeAsync(() => {
      component.value = 50;
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc', 2500);
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args).toBeGreaterThan(55);
    }));

    it('should support short press decrements', fakeAsync(() => {
      component.value = 50;
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.dec');
      expect(spy).toHaveBeenCalledWith(49);
    }));

    it('should decrement with step precision', fakeAsync(() => {
      // without adjustments in component: 5.9 - 0.1 = 5.800000000000001
      component.step = 0.1;
      component.value = 5.9;
      fixture.detectChanges();
      tick();

      fakeClick('.dec');
      expect(component.value).toBe(5.8);
    }));

    it('should support long press decrements', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.dec', 2500);
      expect(spy.calls.count()).toBeGreaterThan(8);
      expect(spy.calls.mostRecent().args[0]).toBeLessThan(45);
    }));

    it('should not go beyond upper limit', fakeAsync(() => {
      component.value = 200;
      fixture.detectChanges();
      tick();

      expect(incButton()?.disabled).toBeTruthy();
    }));

    it('should support upper custom limit', fakeAsync(() => {
      component.max = 200;
      component.value = 150;
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      fakeClick('.inc');
      expect(spy).toHaveBeenCalledWith(151);
    }));

    it('should not allow to decrement when lower limit is reached', fakeAsync(() => {
      component.value = -10;
      fixture.detectChanges();
      tick();

      expect(decButton()?.disabled).toBeTruthy();
    }));

    it('should support lower custom limit', fakeAsync(() => {
      component.min = -200;
      component.value = -150;
      fixture.detectChanges();
      tick();
      const spy = spyOn(component, 'valueChange');

      expect(decButton()?.disabled).toBeFalsy();
      fakeClick('.dec');
      expect(spy).toHaveBeenCalledWith(-151);
    }));

    it('should update value and min correctly', fakeAsync(() => {
      fixture.detectChanges();

      component.min = 10;
      component.value = 10;
      fixture.detectChanges();
      tick();
      expect(decButton()?.disabled).toBeTruthy();
      expect(numberValue()).toBe(10);
    }));

    it('should display placeholder text', fakeAsync(() => {
      fixture.detectChanges();

      component.placeholder = 'Placeholder';
      component.value = undefined;
      fixture.detectChanges();
      tick();
      expect(element.querySelector('input')!.placeholder).toBe('Placeholder');
    }));
  });

  describe('as form control', () => {
    let fixture: ComponentFixture<FormHostComponent>;
    let component: FormHostComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(FormHostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should set the initial value', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      expect(numberValue()).toBe(10);
    }));

    it('marks component as touched', fakeAsync(() => {
      fixture.detectChanges();

      fakeClick('.dec');
      flush();

      expect(component.form.controls.input.touched).toBeTrue();
    }));

    it('updates the value in the form', fakeAsync(() => {
      fixture.detectChanges();

      fakeClick('.dec');
      flush();

      expect(component.form.controls.input.value).toBe(9);
    }));

    it('should invalidate with max', () => {
      component.form.controls.input.setValue(2);
      component.max = 1;
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toEqual({ max: { max: 1, actual: 2 } });

      component.max = 2;
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toBeNull();
    });

    it('should invalidate with min', () => {
      component.form.controls.input.setValue(-1);
      component.min = 0;
      fixture.detectChanges();

      expect(component.form.controls.input.errors).toEqual({ min: { min: 0, actual: -1 } });

      component.min = -1;
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

    it('should set max attribute', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.siNumberInput().inputElement().nativeElement?.getAttribute('max')).toBe(
        '100'
      );
    }));

    it('should ignore min if it is not a number', fakeAsync(() => {
      fixture.detectChanges();
      expect(
        component.siNumberInput().inputElement().nativeElement?.getAttribute('min')
      ).toBeNull();
      expect(component.siNumberInput().inputElement().nativeElement?.getAttribute('max')).toBe(
        '100'
      );
    }));
  });
});
