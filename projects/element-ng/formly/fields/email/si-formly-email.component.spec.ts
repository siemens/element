/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';

import { SiFormlyEmailComponent } from './si-formly-email.component';

@Component({
  selector: 'si-formly-test',
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule]
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly email type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'email',
              component: SiFormlyEmailComponent
            }
          ]
        }),
        SiFormlyEmailComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a input of type email', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'mail',
        type: 'email'
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode.getAttribute('type')).toEqual('email');
  });

  it('should display a model value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'mail',
        type: 'email',
        props: {
          required: true
        }
      }
    ];
    componentInstance.model = {
      mail: 'foo@example.org'
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeNode.value).toEqual('foo@example.org');
  });
});
