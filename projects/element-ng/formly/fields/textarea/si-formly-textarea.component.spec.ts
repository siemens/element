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

import { SiFormlyTextareaComponent } from './si-formly-textarea.component';

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

describe('formly autogrowing textarea type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        SiFormlyTextareaComponent,
        FormlyModule.forRoot({
          types: [
            {
              name: 'textarea',
              component: SiFormlyTextareaComponent
            }
          ]
        }),
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a textarea', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'text',
        type: 'textarea'
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField).toBeDefined();
  });
  it('should apply the rows config', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField.nativeNode.getAttribute('rows')).toEqual('10');
  });

  it('should apply model value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ];
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model = {
      text: val
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField.nativeNode.value).toEqual(val);
  });

  it('should apply model value to its wrapper', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ];
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model = {
      text: val
    };
    fixture.detectChanges();

    const wrapper = fixture.debugElement.query(By.css('div'));
    expect(wrapper).toBeDefined();
    expect(wrapper.nativeNode.getAttribute('data-replicated-value')).toEqual(val);
  });

  it('should apply changes to model value and its wrapper', async () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ];
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model = {
      text: ''
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('textarea'));
    const wrapper = fixture.debugElement.query(By.css('div'));

    inputField.nativeElement.value = val;
    inputField.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(componentInstance.model.text).toEqual(val);
    expect(wrapper.nativeNode.getAttribute('data-replicated-value')).toEqual(val);
  });
});
