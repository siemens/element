/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

import { SiFormlyDateTimeComponent } from './si-formly-datetime.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields()" [model]="model()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
}

let date: Date;

describe('formly datetime-type', () => {
  const startDate = '2021-08-26T08:45:00.000+02:00';
  let startDateInputVal = '2021-08-26 06:45:00';
  const startDateUTCShort = '2021-08-26T06:45:00Z';
  const startDateUTCSLong = '2021-08-26T06:45:00.000Z';

  let fixture: ComponentFixture<FormlyTestComponent>;
  let component: FormlyTestComponent;

  const inputEl = (): HTMLInputElement => fixture.debugElement.query(By.css('input')).nativeElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    date = new Date(startDate);
    vi.setSystemTime(date);
    const d = new Date();

    const pad = (n: number): string => (n > 9 ? `${n}` : `0${n}`);
    startDateInputVal = `2021-08-${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'datetime',
              component: SiFormlyDateTimeComponent
            }
          ]
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have a timezoned display value - as short value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'datetime',
        props: {
          dateConfig: {
            dateFormat: 'short'
          }
        }
      }
    ]);
    component.model.set({
      name: startDateUTCShort
    });
    fixture.detectChanges();
    const inputField = inputEl();
    // The value should be timezone agnostic.
    expect(new Date(inputField.value)).toEqual(new Date(startDateInputVal));
  });

  it('should handle time zone and result into value as short value', async () => {
    component.fields.set([
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
    ]);
    component.model.set({
      name: ''
    });
    fixture.detectChanges();
    const inputField = inputEl();
    inputField.value = startDateInputVal;
    inputField.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(200);
    await fixture.whenStable();
    expect(component.model().name).toEqual(new Date(startDateUTCShort));
  });

  it('should have a timezoned display value - as long value', () => {
    component.fields.set([
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
    ]);
    component.model.set({
      name: startDateUTCSLong
    });
    fixture.detectChanges();
    // The value should be timezone agnostic.
    expect(new Date(inputEl().value)).toEqual(new Date(startDateInputVal));
  });

  it('should handle time zone and result into value as long value', async () => {
    component.fields.set([
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
    ]);
    component.model.set({
      name: ''
    });
    fixture.detectChanges();

    const inputField = inputEl();
    inputField.value = startDateInputVal;
    inputField.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(200);
    await fixture.whenStable();
    expect(component.model().name).toEqual(new Date(startDateUTCSLong));
  });

  it('should have a timezoned display value - as data value', async () => {
    component.fields.set([
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
    ]);
    component.model.set({
      name: startDate
    });
    fixture.detectChanges();
    // The value should be timezone agnostic.
    expect(inputEl().value).toEqual(startDateInputVal);
  });

  it('should handle time zone and result into value as date', async () => {
    component.fields.set([
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
    ]);
    component.model.set({
      name: null
    });
    fixture.detectChanges();
    const inputField = inputEl();
    inputField.value = startDateInputVal;
    inputField.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.model().name.getTime()).toEqual(date.getTime());
  });

  it('should have calendar-button', async () => {
    component.fields.set([
      {
        key: 'name',
        type: 'datetime'
      }
    ]);

    fixture.detectChanges();
    const calendarButton = fixture.debugElement.query(By.css('button[name="open-calendar"]'));
    expect(calendarButton).toBeTruthy();
  });
});
