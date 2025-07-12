/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { JSONSchema7 } from 'json-schema';
import { of } from 'rxjs';

import { SiFormlyComponent } from './si-formly.component';
import { SiFormlyModule } from './si-formly.module';

@Component({
  imports: [ReactiveFormsModule, FormlyBootstrapModule, SiFormlyModule],
  template: `<si-formly
    [model]="model"
    [schema]="schema"
    [fields]="fields"
    [form]="form"
    [labelWidth]="labelWidth"
    (formChange)="formChanged()"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly formly = viewChild.required(SiFormlyComponent<Record<string, any>>);
  schema?: JSONSchema7;
  form?: FormGroup<any>;
  fields?: FormlyFieldConfig[];
  labelWidth?: number;
  formChanged(): void {}
  model?: any;
}

describe('ElementFormComponent', () => {
  let wrapperComponent: WrapperComponent;
  let component: SiFormlyComponent<Record<string, any>>;
  let fixture: ComponentFixture<WrapperComponent>;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormlyBootstrapModule, SiFormlyModule, WrapperComponent],
      providers: [
        {
          provide: SiTranslateService,
          useValue: {
            translate: (key: string, params: Record<string, any>) =>
              `translated=>${key}-${JSON.stringify(params)}`,
            translateAsync: (key: string, params: Record<string, any>) =>
              of(`translated=>${key}-${JSON.stringify(params)}`)
          } as SiTranslateService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    spyOn(wrapperComponent, 'formChanged');
    fixture.detectChanges();
    component = wrapperComponent.formly();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form group after onInit', () => {
    expect(component.form()).toBeTruthy();
    expect(wrapperComponent.formChanged).toHaveBeenCalled();
  });

  it('should use a given form group', () => {
    const formGroup = new FormRecord({});
    wrapperComponent.form = formGroup;
    runOnPushChangeDetection(fixture);

    expect(component.form()).toBe(formGroup);
  });

  it('should parse a given json schema', () => {
    const schema: JSONSchema7 = {
      title: 'title',
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          title: 'field1'
        }
      }
    };
    wrapperComponent.schema = schema;
    runOnPushChangeDetection(fixture);
    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should initially not display anything', () => {
    expect(element).not.toContain('formly-form');
  });

  it('should display the form if formgroup and fieldconfig are present', () => {
    const schema: JSONSchema7 = {
      title: 'title',
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          title: 'field1'
        }
      }
    };
    wrapperComponent.form = new FormRecord({});
    wrapperComponent.schema = schema;
    runOnPushChangeDetection(fixture);

    expect(element.innerHTML).toContain('<formly-form');
  });

  it('should apply the labelwidth', () => {
    const schema: JSONSchema7 = {
      title: 'title',
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          title: 'field1'
        }
      }
    };

    wrapperComponent.form = new FormRecord({});
    wrapperComponent.schema = schema;
    wrapperComponent.labelWidth = 500;
    runOnPushChangeDetection(fixture);
    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
  });

  it('should apply a field config', () => {
    const cfg: FormlyFieldConfig[] = [
      {
        key: 'foo',
        type: 'input'
      }
    ];
    wrapperComponent.fields = cfg;
    runOnPushChangeDetection(fixture);
    expect(element.querySelector('input[type=text]')).toBeTruthy();
    expect(element.querySelector('input[type=text]')?.id).toContain('foo');
  });

  it('should apply a field config with labelWidth', () => {
    const cfg: FormlyFieldConfig[] = [
      {
        key: 'foo',
        type: 'input'
      }
    ];
    wrapperComponent.labelWidth = 300;
    wrapperComponent.fields = cfg;
    runOnPushChangeDetection(fixture);
    expect(
      getComputedStyle(element.querySelector('si-form-item')!).getPropertyValue(
        '--si-form-label-width'
      )
    ).toBe('300px');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should apply labelWith to field config when changing the schema', () => {
    wrapperComponent.labelWidth = 500;
    const schema: JSONSchema7 = {
      title: 'title',
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          title: 'field1'
        }
      }
    };

    wrapperComponent.form = new FormRecord({});
    wrapperComponent.schema = schema;
    runOnPushChangeDetection(fixture);

    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should apply labelWidth to fieldArray', () => {
    wrapperComponent.labelWidth = 500;
    wrapperComponent.fields = [
      {
        key: 'inputArray',
        type: 'array',
        fieldArray: {
          fieldGroup: [
            {
              key: 'data',
              type: 'input',
              props: {
                label: 'Input Data'
              }
            }
          ]
        }
      }
    ];
    wrapperComponent.model = {
      inputArray: [{ data: 'test set 1' }]
    };
    runOnPushChangeDetection(fixture);
    expect(element.querySelector('si-formly-array')).toBeTruthy();
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
  });
});
