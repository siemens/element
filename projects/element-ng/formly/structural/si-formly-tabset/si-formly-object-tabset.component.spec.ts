/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiTabComponent, SiTabsetComponent } from '@spike-rabbit/element-ng/tabs';

import { SiFormlyObjectTabsetComponent } from './si-formly-object-tabset.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly tabset type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        SiTabComponent,
        SiTabsetComponent,

        FormlyModule.forRoot({
          types: [
            {
              name: 'tabset',
              component: SiFormlyObjectTabsetComponent
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

  it('should have createa tabset', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.options = {
      formState: {
        selectedTabIndex: 1
      }
    };
    componentInstance.fields = [
      {
        key: 'tabset',
        type: 'tabset',
        fieldGroup: [
          {
            template: '<div><h1>t0</h1></div>',
            props: {
              label: 't0'
            }
          },
          {
            template: '<div><h1>t1</h1></div>',
            props: {
              label: 't1'
            }
          },
          {
            template: '<div><h1>t2</h1></div>',
            props: {
              label: 't2'
            }
          }
        ]
      }
    ];
    fixture.detectChanges();
    const tabsContainer = fixture.debugElement.query(By.css('si-tabset'));
    expect(tabsContainer).toBeTruthy();
    const tabs = tabsContainer.queryAll(By.css('si-tab'));
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(3);
    expect(tabs[0].query(By.css('h1')).nativeElement.innerHTML).toEqual('t0');
    expect(tabs[1].query(By.css('h1')).nativeElement.innerHTML).toEqual('t1');
    expect(tabs[2].query(By.css('h1')).nativeElement.innerHTML).toEqual('t2');
  });
});
