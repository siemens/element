/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';

import { SiFormlyWrapperComponent } from '../../wrapper/si-formly-wrapper.component';
import { SiFormlyNumberComponent } from './si-formly-number.component';

@Component({
  selector: 'si-formly-test',
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule]
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields: FormlyFieldConfig[] = [
    {
      key: 'cost',
      type: 'number',
      props: {
        label: 'Cost of Something',
        required: true,
        numberStep: 10,
        min: 500,
        max: 30000
      }
    }
  ];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly number type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'number',
              component: SiFormlyNumberComponent,
              wrappers: ['form-field']
            }
          ],
          wrappers: [{ name: 'form-field', component: SiFormlyWrapperComponent }]
        }),
        SiFormlyNumberComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should display the number input based on props provided', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;

    componentInstance.model = {
      cost: 19250
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeNode.valueAsNumber).toEqual(19250);

    // Asserting if props is carried over from form fields to the component
    expect(inputField.nativeNode.getAttribute('step')).toEqual('10');
    expect(inputField.nativeNode.getAttribute('min')).toEqual('500');
    expect(inputField.nativeNode.getAttribute('max')).toEqual('30000');

    const labelEl = fixture.nativeElement.querySelector('label');
    expect(labelEl.innerText).toBe('Cost of Something');

    inputField.nativeElement.value = 2000;
    inputField.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(200);

    // Assert if input change reflects the model
    expect(componentInstance.model.cost).toBe(2000);
  }));
});
