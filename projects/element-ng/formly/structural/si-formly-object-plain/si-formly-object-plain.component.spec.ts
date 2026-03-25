/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-ng/translate';
import { of } from 'rxjs';

import { SiFormlyModule } from '../../si-formly.module';
import { SiFormlyObjectPlainComponent as TestComponent } from './si-formly-object-plain.component';

@Component({
  imports: [SiFormlyModule, FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields()" [model]="model()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
}

describe('ElementFormComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'object-plain',
              component: TestComponent
            }
          ]
        })
      ],
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

    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should apply show description', () => {
    wrapperComponent.fields.set([
      {
        key: 'struct',
        type: 'object-plain',
        props: {
          description: 'Object Plain Example'
        },
        fieldGroup: []
      }
    ]);

    fixture.detectChanges();

    const field = fixture.debugElement.query(By.css('si-formly-object-plain'));
    expect(field).toBeTruthy();
    expect(field.nativeElement).toHaveTextContent('Object Plain Example');
  });

  it('should apply object-plain with property key', () => {
    wrapperComponent.fields.set([
      {
        key: 'struct',
        type: 'object-plain',
        props: {
          description: 'Object Plain Example'
        },
        fieldGroup: [
          {
            key: 'property1',
            type: 'textdisplay',
            wrappers: ['form-field'],
            props: {
              label: 'Property 1'
            }
          },
          {
            key: 'property2',
            type: 'input',
            props: {
              label: 'Property 2',
              readonly: true
            }
          }
        ]
      }
    ]);
    wrapperComponent.model.set({
      struct: [{ property1: 'test set 1', property2: 'test set 2' }]
    });

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('si-form-item'));
    expect(rows).toBeTruthy();
    expect(rows.length).toEqual(2);
    const label1 = rows[0].nativeElement.innerText;
    expect(label1).toContain('Property 1');
    const label2 = rows[1].nativeElement.innerText;
    expect(label2).toContain('Property 2');
  });
});
