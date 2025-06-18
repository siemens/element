/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiDatepickerModule, SiTimepickerComponent } from '@siemens/element-ng/datepicker';

import { SiFormlyTimeComponent } from './si-formly-time.component';

@Component({
  selector: 'si-formly-test',
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SiDatepickerModule, FormlyModule]
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
  cdRef = inject(ChangeDetectorRef);
}

describe('formly time-type', () => {
  const startDateString = '2021-08-26T08:45:07.001';
  const startDate = new Date(startDateString);
  let fixture: ComponentFixture<FormlyTestComponent>;
  let component: FormlyTestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        SiDatepickerModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'time',
              component: SiFormlyTimeComponent
            }
          ]
        }),
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  it('should not display labels by default', () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {}
      }
    ];
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.hideLabels()).toBeTrue();
  });

  it('should set timepicker to readonly', () => {
    component.fields = [
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
    ];
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.readonly()).toBeTrue();
  });

  it('should set timepicker hideLabels to false', () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: {
            hideLabels: false
          }
        }
      }
    ];
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.hideLabels()).toBeFalse();
  });

  it('should not use the padding-inline-end or class .form-control-has-icon', () => {
    component.fields = [
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
    ];
    fixture.detectChanges();

    const inputFields = fixture.debugElement.queryAll(By.css(`input`));
    inputFields.forEach(inputField => {
      expect(getComputedStyle(inputField.nativeElement).paddingInlineEnd).toBe('7px');
    });
  });

  it('should set timepicker showMinutes to false', () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMinutes: false }
        }
      }
    ];
    component.model = {
      time: startDate
    };
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMinutes()).toBeFalse();
  });

  it('should set timepicker showSeconds to true', () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showSeconds: true }
        }
      }
    ];
    component.model = {
      time: startDate
    };
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showSeconds()).toBeTrue();
  });

  it('should set timepicker showSeconds to true', () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMilliseconds: true }
        }
      }
    ];
    component.model = {
      time: startDate
    };
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMilliseconds()).toBeTrue();
  });

  it(`should set timepicker show meridian`, () => {
    component.fields = [
      {
        key: 'time',
        type: 'time',
        props: {
          timeConfig: { showMeridian: true }
        }
      }
    ];
    component.model = {
      time: startDate
    };
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(SiTimepickerComponent));
    const instance = debugEl.componentInstance as SiTimepickerComponent;
    expect(instance.showMeridian()).toBeTrue();
  });

  it(`should support date string value input`, () => {
    component.fields = [
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
    ];
    component.model = {
      time: startDateString
    };
    fixture.detectChanges();

    const expected = new Date(startDateString);
    expect(component.form.get('time')?.value).toEqual(expected);
  });

  it(`should support date string value input on model change`, () => {
    component.fields = [
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
    ];
    component.model = {
      time: startDateString
    };
    fixture.detectChanges();

    const newDateString = '2021-08-26T10:45:07.001';
    component.model = {
      time: newDateString
    };
    component.cdRef.detectChanges();
    fixture.detectChanges();

    const expected = new Date(newDateString);
    expect(component.form.get('time')?.value).toEqual(expected);
  });
});
