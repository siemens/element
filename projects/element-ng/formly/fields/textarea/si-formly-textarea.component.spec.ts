/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

import { SiFormlyTextareaComponent } from './si-formly-textarea.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields()" [model]="model()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
}

describe('formly autogrowing textarea type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'textarea',
              component: SiFormlyTextareaComponent
            }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a textarea', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'text',
        type: 'textarea'
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField).toBeDefined();
  });
  it('should apply the rows config', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField.nativeNode).toHaveAttribute('rows', '10');
  });

  it('should apply model value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ]);
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model.set({
      text: val
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('textarea'));
    expect(inputField.nativeNode.value).toEqual(val);
  });

  it('should apply model value to its wrapper', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ]);
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model.set({
      text: val
    });
    fixture.detectChanges();

    const wrapper = fixture.debugElement.query(By.css('div'));
    expect(wrapper).toBeDefined();
    expect(wrapper.nativeNode).toHaveAttribute('data-replicated-value', val);
  });

  it('should apply changes to model value and its wrapper', async () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'text',
        type: 'textarea',
        props: {
          rows: 10
        }
      }
    ]);
    const val = 'lorem\nipsum\ndolor\nfoo';
    componentInstance.model.set({
      text: ''
    });
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('textarea'));
    const wrapper = fixture.debugElement.query(By.css('div'));

    inputField.nativeElement.value = val;
    inputField.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(componentInstance.model().text).toEqual(val);
    expect(wrapper.nativeNode).toHaveAttribute('data-replicated-value', val);
  });
});
