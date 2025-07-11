/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiDatepickerModule } from '@siemens/element-ng/datepicker';

import { SiFormlyDateTimeComponent } from './si-formly-datetime.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, SiDatepickerModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

let date: Date;

describe('formly datetime-type', () => {
  const startDate = '2021-08-26T08:45:00.000+02:00';
  let startDateInputVal = '2021-08-26 06:45:00';
  const startDateUTCShort = '2021-08-26T06:45:00Z';
  const startDateUTCSLong = '2021-08-26T06:45:00.000Z';

  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeAll(() => {
    // Seems to be installed somewhere else...
    jasmine.clock().uninstall();
  });

  beforeEach(() => {
    jasmine.clock().install();
    date = new Date(startDate);
    jasmine.clock().mockDate(date);
    const d = new Date();

    const pad = (n: number): string => (n > 9 ? `${n}` : `0${n}`);
    startDateInputVal = `2021-08-${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
      d.getSeconds()
    )}`;

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        SiDatepickerModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'datetime',
              component: SiFormlyDateTimeComponent
            }
          ]
        }),
        SiFormlyDateTimeComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should have a timezoned display value - as short value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            dateFormat: 'short'
          }
        }
      }
    ];
    componentInstance.model = {
      name: startDateUTCShort
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    // The value should be timezone agnostic.
    expect(new Date(inputField.nativeElement.value)).toEqual(new Date(startDateInputVal));
  });

  it('should handle time zone and result into value as short value', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            showTime: true,
            showSeconds: true,
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
          }
        }
      }
    ];
    componentInstance.model = {
      name: ''
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    inputField.nativeElement.value = startDateInputVal;
    inputField.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(200);
    expect(componentInstance.model.name).toEqual(new Date(startDateUTCShort));
  }));

  it('should have a timezoned display value - as long value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            showTime: true,
            showSeconds: true,
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
          }
        }
      }
    ];
    componentInstance.model = {
      name: startDateUTCSLong
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    // The value should be timezone agnostic.
    expect(new Date(inputField.nativeElement.value)).toEqual(new Date(startDateInputVal));
  });

  it('should handle time zone and result into value as long value', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            showTime: true,
            showSeconds: true,
            showMilliseconds: true,
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
          }
        }
      }
    ];
    componentInstance.model = {
      name: ''
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    inputField.nativeElement.value = startDateInputVal;
    inputField.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    tick(200);
    expect(componentInstance.model.name).toEqual(new Date(startDateUTCSLong));
  }));

  it('should have a timezoned display value - as data value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            showTime: true,
            showSeconds: true,
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
          }
        }
      }
    ];
    componentInstance.model = {
      name: startDate
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    // The value should be timezone agnostic.
    expect(inputField.nativeElement.value).toEqual(startDateInputVal);
  });

  it('should handle time zone and result into value as date', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            showTime: true,
            showSeconds: true,
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss'
          }
        }
      }
    ];
    componentInstance.model = {
      name: null
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    inputField.nativeElement.value = startDateInputVal;
    inputField.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(200);

    expect(componentInstance.model.name.getTime()).toEqual(date.getTime());
  }));

  it('should have calendar-button', async () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'name',
        type: 'datetime'
      }
    ];

    fixture.detectChanges();
    const calendarButton = fixture.debugElement.query(By.css('button[name="open-calendar"]'));
    expect(calendarButton).toBeTruthy();
  });
});
