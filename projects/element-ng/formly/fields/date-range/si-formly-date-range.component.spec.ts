/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

import { SiFormlyWrapperComponent } from '../../wrapper/si-formly-wrapper.component';
import { SiFormlyDateRangeComponent } from './si-formly-date-range.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields()" [model]="model()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([
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
  ]);
  readonly model = signal<any>({});
}

describe('formly date range type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'date-range',
              component: SiFormlyDateRangeComponent,
              wrappers: ['form-field']
            }
          ],
          wrappers: [{ name: 'form-field', component: SiFormlyWrapperComponent }]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have a input of type text for date-range', () => {
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();

    expect(inputField.nativeNode).toHaveAttribute('type', 'text');
  });

  it('should display based on input and reflect the model', async () => {
    const monthOfSelection = new Date().toLocaleString('default', { month: 'long' });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.model.set({
      leasePeriod: {
        start: new Date(),
        end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    });
    const calendarButton = fixture.nativeElement.querySelector('[aria-label="Open calendar"]');
    calendarButton.click();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('si-datepicker-overlay')).toBeInTheDocument();

    expect(document.querySelector<HTMLElement>('si-day-selection')!).toHaveTextContent(
      monthOfSelection
    );
  });
});
