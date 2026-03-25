/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import {
  SiSelectMultiValueDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

import { SiFormlySelectComponent } from './si-formly-select.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields()" [model]="model()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
}
describe('formly si-select', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;
  const optionsList = [
    { id: 'good', title: 'Good' },
    {
      id: 'average',
      title: 'Average'
    },
    { id: 'poor', title: 'Poor' },
    {
      id: 'unhealthy',
      title: 'Unhealthy'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          types: [
            {
              name: 'si-select',
              component: SiFormlySelectComponent
            }
          ]
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should use si-select single selection', async () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'select',
        type: 'si-select',
        props: {
          optionsList: optionsList
        }
      }
    ]);
    componentInstance.model.set({
      select: []
    });

    fixture.detectChanges();
    const singleSelect = fixture.debugElement.query(By.directive(SiSelectSingleValueDirective));
    expect(singleSelect).toBeTruthy();
  });

  it('should use si-select multi selection', async () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields.set([
      {
        key: 'select',
        type: 'si-select',
        props: {
          multi: true,
          optionsList: optionsList
        }
      }
    ]);
    componentInstance.model.set({
      select: []
    });

    fixture.detectChanges();
    const multiSelect = fixture.debugElement.query(By.directive(SiSelectMultiValueDirective));
    expect(multiSelect).toBeTruthy();
  });
});
