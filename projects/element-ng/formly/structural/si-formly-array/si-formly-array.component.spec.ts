/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { of } from 'rxjs';

import { SiFormlyModule } from '../../si-formly.module';
import { SiFormlyArrayComponent } from './si-formly-array.component';

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
              name: 'array',
              component: SiFormlyArrayComponent
            }
          ]
        })
      ],
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

    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should apply array input with property key', () => {
    wrapperComponent.fields.set([
      {
        key: 'inputArray',
        type: 'array',
        fieldArray: {
          fieldGroup: [
            {
              type: 'textdisplay',
              props: {
                key: 'data',
                label: 'Input Data'
              }
            }
          ]
        }
      }
    ]);
    wrapperComponent.model.set({
      inputArray: [{ data: 'test set 1' }]
    });

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.row'));
    expect(rows).toBeTruthy();
    expect(rows.length).toEqual(1);
    expect(rows[0].nativeElement).toHaveTextContent('test set 1');
  });
});
