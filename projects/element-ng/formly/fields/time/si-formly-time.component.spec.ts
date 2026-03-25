/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { SiTimepickerComponent } from '@siemens/element-ng/datepicker';

import { SiFormlyTimeComponent } from './si-formly-time.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields()" [model]="model()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
}

describe('formly time-type', () => {
  const startDateString = '2021-08-26T08:45:07.001';
  const startDate = new Date(startDateString);
  let fixture: ComponentFixture<FormlyTestComponent>;
  let component: FormlyTestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'time',
              component: SiFormlyTimeComponent
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  it('should not display labels by default', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {}
      }
    ]);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.hideLabels()).toBe(true);
  });

  it('should set timepicker to readonly', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          readonly: true,
          timeConfig: {
            showSeconds: true,
            showMilliseconds: true,
            showMeridian: true
          }
        }
      }
    ]);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.readonly()).toBe(true);
  });

  it('should set timepicker hideLabels to false', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: {
            hideLabels: false
          }
        }
      }
    ]);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.hideLabels()).toBe(false);
  });

  it('should not use the padding-inline-end or class .form-control-has-icon', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: {
            showSeconds: true,
            showMilliseconds: true
          }
        }
      }
    ]);
    fixture.detectChanges();

    const inputFields = fixture.debugElement.queryAll(By.css(`input`));
    inputFields.forEach(inputField => {
      expect(getComputedStyle(inputField.nativeElement).paddingInlineEnd).toBe('7px');
    });
  });

  it('should set timepicker showMinutes to false', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMinutes: false }
        }
      }
    ]);
    component.model.set({
      time: startDate
    });
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMinutes()).toBe(false);
  });

  it('should set timepicker showSeconds to true', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showSeconds: true }
        }
      }
    ]);
    component.model.set({
      time: startDate
    });
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showSeconds()).toBe(true);
  });

  it('should set timepicker showSeconds to true', () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMilliseconds: true }
        }
      }
    ]);
    component.model.set({
      time: startDate
    });
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMilliseconds()).toBe(true);
  });

  it(`should set timepicker show meridian`, () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMeridian: true }
        }
      }
    ]);
    component.model.set({
      time: startDate
    });
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMeridian()).toBe(true);
  });

  it(`should support date string value input`, () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: {
            showSeconds: true,
            showMilliseconds: true
          }
        }
      }
    ]);
    component.model.set({
      time: startDateString
    });
    fixture.detectChanges();

    const expected = new Date(startDateString);
    expect(component.form.get('time')?.value).toEqual(expected);
  });

  it(`should support date string value input on model change`, () => {
    component.fields.set([
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: {
            showSeconds: true,
            showMilliseconds: true
          }
        }
      }
    ]);
    component.model.set({
      time: startDateString
    });
    fixture.detectChanges();

    const newDateString = '2021-08-26T10:45:07.001';
    component.model.set({
      time: newDateString
    });
    fixture.detectChanges();

    const expected = new Date(newDateString);
    expect(component.form.get('time')?.value).toEqual(expected);
  });
});
