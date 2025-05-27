/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { SiFormFieldsetComponent } from './form-fieldset/si-form-fieldset.component';
import { SiFormContainerComponent } from './si-form-container/si-form-container.component';
import { SiFormItemComponent } from './si-form-item/si-form-item.component';
import { provideFormValidationErrorMapper } from './si-form-validation-error.provider';
import { SiFormModule } from './si-form.module';
import { SiFormFieldsetHarness } from './testing/si-form-fieldset.harness';
import { SiFormItemHarness } from './testing/si-form-item.harness';

describe('SiForm', () => {
  describe('with container', () => {
    @Component({
      template: `
        <si-form-container
          [errorCodeTranslateKeyMap]="{
            'input.required': 'input required',
            maxlength: 'input maxlength'
          }"
        >
          <form si-form-container-content [formGroup]="form">
            <si-form-fieldset label="Fieldset-CB">
              <si-form-item label="CB-1" [disableErrorPrinting]="false">
                <input formControlName="cb1" class="form-check-input" type="checkbox" />
              </si-form-item>
            </si-form-fieldset>
            <si-form-fieldset label="Fieldset-RADIO">
              <si-form-item label="Radio-1">
                <input
                  formControlName="radio"
                  class="form-check-input"
                  type="radio"
                  value="r1"
                  required
                />
              </si-form-item>
              <si-form-item label="Radio-2">
                <input
                  formControlName="radio"
                  class="form-check-input"
                  type="radio"
                  value="r2"
                  required
                />
              </si-form-item>
            </si-form-fieldset>
            <si-form-item label="Input" [disableErrorPrinting]="false">
              <input formControlName="input" class="form-control" />
            </si-form-item>
          </form>
        </si-form-container>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [
        ReactiveFormsModule,
        SiFormFieldsetComponent,
        SiFormItemComponent,
        SiFormContainerComponent
      ]
    })
    class TestHostComponent {
      form = new FormGroup({
        cb1: new FormControl(false, Validators.requiredTrue),
        radio: new FormControl('', Validators.required),
        input: new FormControl('', [Validators.required, Validators.maxLength(1)])
      });
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          SiFormModule.withConfiguration({ validationErrorMapper: { required: 'required' } })
        ]
      }).compileComponents();
    });

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      // wait for the component being fully initialized
      await fixture.whenStable();
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('it should render checkbox properly when using a fieldset', async () => {
      const fieldset = await loader.getHarness(SiFormFieldsetHarness.with('Fieldset-CB'));

      const item = await fieldset.getFormField({ label: 'CB-1' });

      // verify that no spacer is rendered
      expect(await item.getLabel()).toBe(undefined);
    });

    it('should render globally translated validation message', async () => {
      fixture.componentInstance.form.markAllAsTouched();
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'CB-1' }));
      expect(await field.getErrorMessages()).toEqual(['required']);
      await field.toggleCheck();
      expect(await field.getErrorMessages()).toEqual([]);
    });

    it('should render form-container validation messages', async () => {
      fixture.componentInstance.form.markAllAsTouched();
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      expect(await field.getErrorMessages()).toEqual(['input required']);
      await field.sendKeys('123');
      expect(await field.getErrorMessages()).toEqual(['input maxlength']);
    });

    it('should group error messages', async () => {
      fixture.componentInstance.form.markAllAsTouched();
      const field1 = await loader.getHarness(SiFormItemHarness.with({ label: 'Radio-1' }));
      expect(await field1.getErrorMessages()).toEqual([]);
      const field2 = await loader.getHarness(SiFormItemHarness.with({ label: 'Radio-2' }));
      expect(await field2.getErrorMessages()).toEqual([]);
      const fieldset = await loader.getHarness(SiFormFieldsetHarness.with('Fieldset-RADIO'));
      expect(await fieldset.getErrorMessages()).toEqual(['required']);
    });

    it('should only have a required indicator on the fieldset', async () => {
      fixture.componentInstance.form.markAllAsTouched();
      const field1 = await loader.getHarness(SiFormItemHarness.with({ label: 'Radio-1' }));
      expect(await field1.isRequired()).toBeFalse();
      const field2 = await loader.getHarness(SiFormItemHarness.with({ label: 'Radio-2' }));
      expect(await field2.isRequired()).toBeFalse();
      const fieldset = await loader.getHarness(SiFormFieldsetHarness.with('Fieldset-RADIO'));
      expect(await fieldset.isRequired()).toBeTrue();
    });
  });

  describe('without container', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <si-form-item label="Input" [disableErrorPrinting]="false">
            <input formControlName="input" />
          </si-form-item>
        </form>
      `,
      imports: [ReactiveFormsModule, SiFormItemComponent]
    })
    class TestHostComponent {
      form = new FormGroup({
        input: new FormControl('', [Validators.required, Validators.maxLength(1)])
      });
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();
    });

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      // wait for the component being fully initialized
      await fixture.whenStable();
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should render globally translated validation messages', async () => {
      fixture.componentInstance.form.markAllAsTouched();
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      expect(await field.getErrorMessages()).toEqual(['A value is required.']);
    });

    it('should have a required indicator', async () => {
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      expect(await field.isRequired()).toBeTrue();
    });

    it('should update required indicator', async () => {
      fixture.componentInstance.form.controls.input.setValidators([]);
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      expect(await field.isRequired()).toBeFalse();
    });
  });

  describe('with template driven forms', () => {
    @Component({
      template: `
        <form>
          <si-form-item label="Input" [disableErrorPrinting]="false">
            <input name="value" [required]="required" [(ngModel)]="value" />
          </si-form-item>
        </form>
      `,
      imports: [SiFormItemComponent, FormsModule]
    })
    class TestHostComponent {
      value = '';
      required = true;
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();
    });

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      // wait for the component being fully initialized
      await fixture.whenStable();
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should update required indicator', async () => {
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      expect(await field.isRequired()).toBeTrue();
      fixture.componentInstance.required = false;
      expect(await field.isRequired()).toBeFalse();
    });
  });

  describe('with error mapper', () => {
    @Component({
      template: `
        <si-form-item label="Input">
          <input type="text" id="email" class="form-control" [formControl]="email" />
        </si-form-item>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [ReactiveFormsModule, SiFormItemComponent]
    })
    class TestHostComponent {
      readonly email = new FormControl('email', [Validators.email]);
    }
    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;
    let emailMapperSpy: jasmine.Spy<any>;

    beforeEach(async () => {
      emailMapperSpy = jasmine
        .createSpy('email', (error: any) => 'email-' + error)
        .and.callThrough();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          provideFormValidationErrorMapper({
            email: emailMapperSpy
          })
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should call SiFormValidationErrorMapper error function', async () => {
      const field = await loader.getHarness(SiFormItemHarness.with({ label: 'Input' }));
      await field.sendKeys('invalid-email');
      fixture.detectChanges();
      expect(emailMapperSpy).toHaveBeenCalled();
      expect(await field.getErrorMessages()).toEqual(['email-true']);
    });
  });

  describe('with checkbox in legacy and normal mode', () => {
    @Component({
      imports: [SiFormItemComponent, ReactiveFormsModule],
      template: `
        <si-form-item label="Legacy">
          <div class="form-check">
            <input type="checkbox" id="legacy" class="form-check-input" [formControl]="legacy" />
            <label for="legacy">Legacy cb label</label>
          </div>
        </si-form-item>
        <si-form-item label="Normal">
          <input type="checkbox" class="form-check-input" [formControl]="normal" />
        </si-form-item>
      `
    })
    class TestHostComponent {
      legacy = new FormControl(true);
      normal = new FormControl(true);
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should render normal checkbox', async () => {
      const harness = await loader.getHarness(SiFormItemHarness.with({ label: 'Normal' }));
      expect(await harness.getFormCheckLabel()).toBe('Normal');
      expect(await harness.getCheckValue()).toBe('on');
    });

    it('should render legacy checkbox', async () => {
      const harness = await loader.getHarness(SiFormItemHarness.with({ label: 'Legacy' }));
      expect(await harness.getLabel()).toBe('Legacy');
      expect(await harness.getCheckValue()).toBe('on');
    });
  });
});
