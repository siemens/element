/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { of } from 'rxjs';

import { SiFormlyModule } from '../../si-formly.module';
import {
  SiFormlyArrayComponent,
  SiFormlyArrayComponent as TestComponent
} from './si-formly-array.component';

@Component({
  imports: [SiFormlyModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('ElementFormComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'array',
              component: SiFormlyArrayComponent
            }
          ]
        }),
        SiFormlyModule,
        TestComponent,
        WrapperComponent
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should apply array input with property key', () => {
    wrapperComponent.fields = [
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
    ];
    wrapperComponent.model = {
      inputArray: [{ data: 'test set 1' }]
    };

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.row'));
    expect(rows).toBeTruthy();
    expect(rows.length).toEqual(1);
    expect(rows[0].nativeElement.innerText).toContain('test set 1');
  });
});
