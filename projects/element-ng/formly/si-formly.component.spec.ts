/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { provideMockTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';
import { JSONSchema7 } from 'json-schema';
import { of } from 'rxjs';

import { SiFormlyComponent } from './si-formly.component';
import { SiFormlyModule } from './si-formly.module';

describe('ElementFormComponent', () => {
  let schemaInput: WritableSignal<JSONSchema7 | undefined>;
  let formInput: WritableSignal<FormGroup<any> | undefined>;
  let fieldsInput: WritableSignal<FormlyFieldConfig[]>;
  let labelWidthInput: WritableSignal<number | undefined>;
  let modelInput: WritableSignal<Record<string, any> | undefined>;
  let component: SiFormlyComponent<Record<string, any>>;
  let fixture: ComponentFixture<SiFormlyComponent<Record<string, any>>>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormlyBootstrapModule, SiFormlyModule],
      providers: [
        provideMockTranslateServiceBuilder(
          () =>
            ({
              translate: (key: string, params: Record<string, any>) =>
                `translated=>${key}-${JSON.stringify(params)}`,
              translateAsync: (key: string, params: Record<string, any>) =>
                of(`translated=>${key}-${JSON.stringify(params)}`)
            }) as SiTranslateService
        )
      ]
    }).compileComponents();
  });

  beforeEach(async () => {
    schemaInput = signal(undefined);
    formInput = signal(undefined);
    fieldsInput = signal([]);
    labelWidthInput = signal(undefined);
    modelInput = signal(undefined);
    fixture = TestBed.createComponent(SiFormlyComponent<Record<string, any>>, {
      bindings: [
        inputBinding('schema', schemaInput),
        inputBinding('form', formInput),
        inputBinding('fields', fieldsInput),
        inputBinding('labelWidth', labelWidthInput),
        inputBinding('model', modelInput)
      ]
    });
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form group after onInit', () => {
    expect(component.form()).toBeTruthy();
  });

  it('should use a given form group', async () => {
    const formGroup = new FormRecord({});
    formInput.set(formGroup);
    await fixture.whenStable();

    expect(component.form()).toBe(formGroup);
  });

  it('should parse a given json schema', async () => {
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
    schemaInput.set(schema);
    await fixture.whenStable();

    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should initially not display anything', () => {
    expect(element.textContent).not.toContain('formly-form');
  });

  it('should display the form if formgroup and fieldconfig are present', async () => {
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
    formInput.set(new FormRecord({}));
    schemaInput.set(schema);
    await fixture.whenStable();

    expect(element.innerHTML).toContain('<formly-form');
  });

  it('should apply the labelwidth', async () => {
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

    formInput.set(new FormRecord({}));
    schemaInput.set(schema);
    labelWidthInput.set(500);
    await fixture.whenStable();

    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
  });

  it('should apply a field config', async () => {
    const cfg: FormlyFieldConfig[] = [
      {
        key: 'foo',
        type: 'input'
      }
    ];
    fieldsInput.set(cfg);
    await fixture.whenStable();

    expect(element.querySelector('input[type=text]')).toBeTruthy();
    expect(element.querySelector('input[type=text]')?.id).toContain('foo');
  });

  it('should apply a field config with labelWidth', async () => {
    const cfg: FormlyFieldConfig[] = [
      {
        key: 'foo',
        type: 'input'
      }
    ];
    labelWidthInput.set(300);
    fieldsInput.set(cfg);
    await fixture.whenStable();

    expect(
      getComputedStyle(element.querySelector('si-form-item')!).getPropertyValue(
        '--si-form-label-width'
      )
    ).toBe('300px');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should apply labelWith to field config when changing the schema', async () => {
    labelWidthInput.set(500);
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

    formInput.set(new FormRecord({}));
    schemaInput.set(schema);
    await fixture.whenStable();

    expect(element.querySelector('b')!.textContent).toContain('title');
    expect(element.querySelector('label')!.textContent).toContain('field1');
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
    expect(element.querySelector('input[type=text]')).toBeTruthy();
  });

  it('should apply labelWidth to fieldArray', async () => {
    labelWidthInput.set(500);
    fieldsInput.set([
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
    ]);
    modelInput.set({
      inputArray: [{ data: 'test set 1' }]
    });
    await fixture.whenStable();

    expect(element.querySelector('si-formly-array')).toBeTruthy();
    expect(
      getComputedStyle(element.querySelector('label')!).getPropertyValue('--si-form-label-width')
    ).toBe('500px');
  });
});
