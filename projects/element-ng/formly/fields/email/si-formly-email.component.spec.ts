/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

import { SiFormlyEmailComponent } from './si-formly-email.component';

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

describe('formly email type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'email',
              component: SiFormlyEmailComponent
            }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a input of type email', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'mail',
        type: 'email'
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode).toHaveAttribute('type', 'email');
  });

  it('should display a model value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'mail',
        type: 'email',
        props: {
          required: true
        }
      }
    ]);
    componentInstance.model.set({
      mail: 'foo@example.org'
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeNode.value).toEqual('foo@example.org');
  });
});
