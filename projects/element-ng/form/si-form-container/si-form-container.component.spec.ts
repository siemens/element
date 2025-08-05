/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SiFormContainerComponent,
  SiFormModule,
  SiFormValidationErrorMapper
} from '@siemens/element-ng/form';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

// A timeout that works with `await`. We have to use `waitForAsync()``
// in the tests below because `tick()` doesn't work because `ResizeObserver`
// operates outside of the zone
const timeout = async (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

interface TestForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
}

@Component({
  imports: [ReactiveFormsModule, SiFormContainerComponent],
  template: `
    <si-form-container
      #formContainer
      [form]="form"
      [errorCodeTranslateKeyMap]="customErrorMapper"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestHostComponent {
  cdRef = inject(ChangeDetectorRef);
  readonly formContainer = viewChild.required<SiFormContainerComponent<TestForm>>('formContainer');
  form? = new FormGroup({
    name: new FormControl('Pe', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('email', [Validators.email])
  });
  enableValidationHelp = false;
  customErrorMapper?: SiFormValidationErrorMapper | Map<string, string>;
}

@Component({
  imports: [SiFormContainerComponent],
  template: `
    <si-form-container style="inline-size: 100px" [form]="form">
      <si-form-container si-form-container-content [form]="form">
        <div si-form-container-content style="block-size: 10px"></div>
      </si-form-container>
    </si-form-container>
  `
})
class TestHostWithNestingComponent {
  form = new FormGroup({});
}

describe('SiFormContainerComponent', () => {
  describe('with custom error messages', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let formContainer: SiFormContainerComponent<TestForm>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          SiFormModule.withConfiguration({
            validationErrorMapper: { minlength: 'custom-length-message' }
          }),
          TestHostComponent
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      formContainer = component.formContainer();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });

    describe('userInteractedWithForm', () => {
      it('shall return false with no form', () => {
        component.form = undefined;
        component.cdRef.markForCheck();
        fixture.detectChanges();
        expect(formContainer.userInteractedWithForm).toBeFalse();
      });

      it('shall return true with touched control', () => {
        expect(formContainer.userInteractedWithForm).toBeFalse();
        expect(formContainer.userInteractedWithForm).toBeFalse();
        component.form!.controls.name.markAsTouched();
        expect(formContainer.userInteractedWithForm).toBeTrue();
      });

      it('shall return true with dirty control', () => {
        expect(formContainer.userInteractedWithForm).toBeFalse();
        expect(formContainer.userInteractedWithForm).toBeFalse();
        component.form!.controls.name.markAsDirty();
        expect(formContainer.userInteractedWithForm).toBeTrue();
      });
    });

    describe('validFormContainerMessage', () => {
      it('shall return false with valid form and no user interaction', () => {
        component.form!.setValue({ name: 'Peter', email: 'peter@samlple.com' });
        expect(formContainer.validFormContainerMessage).toBeFalse();
      });

      it('shall return false with invalid form and no user interaction', () => {
        expect(formContainer.validFormContainerMessage).toBeFalse();
      });

      it('shall return true with valid form and user interaction', () => {
        component.form!.setValue({ name: 'Peter', email: 'peter@samlple.com' });
        component.form!.controls.name.markAsTouched();
        expect(formContainer.validFormContainerMessage).toBeTrue();
      });

      it('shall return false with invalid form and user interaction', () => {
        component.form!.controls.name.markAsTouched();
        expect(formContainer.validFormContainerMessage).toBeFalse();
      });
    });

    describe('invalidFormContainerMessage', () => {
      it('shall return false with valid form and no user interaction', () => {
        component.form!.setValue({ name: 'Peter', email: 'peter@samlple.com' });
        expect(formContainer.invalidFormContainerMessage).toBeFalse();
      });

      it('shall return false with invalid form and no user interaction', () => {
        expect(formContainer.invalidFormContainerMessage).toBeFalse();
      });
      it('shall return false with valid form and user interaction', () => {
        component.form!.setValue({ name: 'Peter', email: 'peter@samlple.com' });
        expect(formContainer.invalidFormContainerMessage).toBeFalse();
        component.form!.controls.name.markAsTouched();
        expect(formContainer.invalidFormContainerMessage).toBeFalse();
      });

      it('shall return true with invalid form and user interaction', () => {
        component.form!.controls.name.markAsTouched();
        expect(formContainer.invalidFormContainerMessage).toBeTrue();
      });
    });
  });

  describe('with nested form containers', () => {
    let fixture: ComponentFixture<TestHostWithNestingComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestHostWithNestingComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostWithNestingComponent);
      fixture.detectChanges();
    });

    it('should create', async () => {
      const spy = spyOn(SiResponsiveContainerDirective.prototype as any, 'setResponsiveSize');
      await timeout(100);
      fixture.detectChanges();
      // ChangeDetection is weird. Checking for the container class never works. I don't know why.
      // So it is verified instead that the `SiResponsiveContainerDirective` is only applied once.
      expect(spy).toHaveBeenCalledOnceWith(100, 26); // 26px = 10px form example + 16px padding
    });
  });
});
