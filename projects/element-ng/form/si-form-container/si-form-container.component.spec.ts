/**
 * Copyright Siemens 2016 - 2025.
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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  SiFormContainerComponent,
  SiFormModule,
  SiFormValidationErrorMapper
} from '@siemens/element-ng/form';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

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
  template: `
    <si-form-container
      #formContainer
      [form]="form"
      [errorCodeTranslateKeyMap]="customErrorMapper"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SiFormContainerComponent]
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
  template: `
    <si-form-container style="inline-size: 100px" [form]="form">
      <si-form-container si-form-container-content [form]="form">
        <div si-form-container-content style="block-size: 10px"></div>
      </si-form-container>
    </si-form-container>
  `,
  imports: [SiFormContainerComponent]
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

    describe('getValidationErrors()', () => {
      it('should return an empty array without a form set', () => {
        expect(formContainer.getValidationErrors().length).toBe(2);
        component.form = undefined;
        component.cdRef.markForCheck();
        fixture.detectChanges();
        expect(formContainer.getValidationErrors()).toBeDefined();
        expect(formContainer.getValidationErrors().length).toBe(0);
      });

      it('should return errors for an invalid form', () => {
        component.form!.controls.email.disable();
        expect(formContainer.getValidationErrors()).toBeDefined();
        expect(formContainer.getValidationErrors()).toEqual([
          {
            errorCodeTranslationKey: 'custom-length-message',
            errorCode: 'minlength',
            controlName: 'name',
            controlNameTranslationKey: 'name',
            errorParams: { requiredLength: 3, actualLength: 2 }
          }
        ]);
      });

      it('should resolve with a custom error mapper', () => {
        component.customErrorMapper = {
          minlength: ({ requiredLength, actualLength }) => `${requiredLength}-${actualLength}`
        };
        runOnPushChangeDetection(fixture);
        expect(formContainer.getValidationErrors()).toBeDefined();
        expect(formContainer.getValidationErrors()).toEqual([
          {
            errorCodeTranslationKey: '3-2',
            errorCode: 'minlength',
            controlName: 'name',
            controlNameTranslationKey: 'name',
            errorParams: { requiredLength: 3, actualLength: 2 }
          },
          {
            controlName: 'email',
            controlNameTranslationKey: 'email',
            errorCode: 'email',
            errorCodeTranslationKey: 'The email is not valid.',
            errorParams: true
          }
        ]);
      });

      it('should return an empty array for a valid form', () => {
        component.form!.controls.email.disable();
        component.form!.patchValue({ name: 'Peter' });
        expect(formContainer.getValidationErrors()).toBeDefined();
        expect(formContainer.getValidationErrors().length).toBe(0);
      });

      it('should return the validation errors of a invalid control', () => {
        expect(formContainer.getValidationErrors('name')).toBeDefined();
        expect(formContainer.getValidationErrors('name').length).toBe(1);
        expect(formContainer.getValidationErrors('name')[0].errorCode).toBe('minlength');
        expect(formContainer.getValidationErrors().length).toBe(2);
      });

      it('should return an empty array when invoking with a control name that does not exist', () => {
        expect(formContainer.getValidationErrors('nameX')).toBeDefined();
        expect(formContainer.getValidationErrors('nameX').length).toBe(0);
        expect(formContainer.getValidationErrors().length).toBe(2);
      });

      it('should include validator errors that belong to the form and not to a control', () => {
        const myValidatorFn: ValidatorFn = () => ({ myError: true });
        component.form!.addValidators(myValidatorFn);
        component.form!.updateValueAndValidity();
        expect(formContainer.getValidationErrors().length).toBe(3);
      });
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

  describe('with no custom error messages', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let formContainer: SiFormContainerComponent<TestForm>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, SiFormModule, TestHostComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      formContainer = component.formContainer();
    });

    it('should return the default error messages', () => {
      expect(formContainer.getValidationErrors()).toEqual([
        {
          errorCodeTranslationKey: 'The minimum number of characters is not met.',
          errorCode: 'minlength',
          controlName: 'name',
          controlNameTranslationKey: 'name',
          errorParams: { requiredLength: 3, actualLength: 2 }
        },
        {
          controlName: 'email',
          controlNameTranslationKey: 'email',
          errorCode: 'email',
          errorCodeTranslationKey: 'The email is not valid.',
          errorParams: true
        }
      ]);
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
