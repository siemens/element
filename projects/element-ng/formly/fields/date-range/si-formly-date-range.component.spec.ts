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

import { SiFormlyWrapperComponent } from '../../wrapper/si-formly-wrapper.component';
import { SiFormlyDateRangeComponent } from './si-formly-date-range.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields: FormlyFieldConfig[] = [
    {
      key: 'leasePeriod',
      type: 'date-range',
      props: {
        autoClose: true,
        siDatepickerConfig: {
          enableTwoMonthDateRange: true,
          showTime: true,
          showSeconds: false,
          showMilliseconds: false,
          disabledTime: true,
          mandatoryTime: false
        },
        label: 'Period of Lease'
      }
    }
  ];
  model!: any;
  options!: FormlyFormOptions;
}

describe('formly date range type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'date-range',
              component: SiFormlyDateRangeComponent,
              wrappers: ['form-field']
            }
          ],
          wrappers: [{ name: 'form-field', component: SiFormlyWrapperComponent }]
        }),
        SiFormlyDateRangeComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a input of type text for date-range', () => {
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();

    expect(inputField.nativeNode.getAttribute('type')).toEqual('text');
  });

  it('should display based on input and reflect the model', async () => {
    const monthOfSelection = new Date().toLocaleString('default', { month: 'long' });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.model = {
      leasePeriod: {
        start: new Date(),
        end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    };
    const calendarButton = fixture.nativeElement.querySelector('[aria-label="Open calendar"]');
    calendarButton.click();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('si-datepicker-overlay')).toBeTruthy();

    expect(document.querySelector<HTMLElement>('si-day-selection')?.innerText).toContain(
      monthOfSelection
    );
  });
});
