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
import { SiFormlyNumberComponent } from './si-formly-number.component';

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
      key: 'cost',
      type: 'number',
      props: {
        label: 'Cost of Something',
        required: true,
        numberStep: 10,
        min: 500,
        max: 30000
      }
    }
  ]);
  readonly model = signal<any>({});
}

describe('formly number type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'number',
              component: SiFormlyNumberComponent,
              wrappers: ['form-field']
            }
          ],
          wrappers: [{ name: 'form-field', component: SiFormlyWrapperComponent }]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display the number input based on props provided', async () => {
    vi.useFakeTimers();
    const componentInstance = fixture.componentInstance;

    componentInstance.model.set({
      cost: 19250
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeNode.valueAsNumber).toEqual(19250);

    // Asserting if props is carried over from form fields to the component
    expect(inputField.nativeNode).toHaveAttribute('step', '10');
    expect(inputField.nativeNode).toHaveAttribute('min', '500');
    expect(inputField.nativeNode).toHaveAttribute('max', '30000');

    const labelEl = fixture.nativeElement.querySelector('label');
    expect(labelEl).toHaveTextContent('Cost of Something');

    inputField.nativeElement.value = 2000;
    inputField.nativeElement.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(200);
    await fixture.whenStable();
    // Assert if input change reflects the model
    expect(componentInstance.model().cost).toBe(2000);
    vi.useRealTimers();
  });
});
