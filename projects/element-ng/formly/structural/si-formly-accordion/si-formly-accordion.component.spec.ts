/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiFormlyModule } from '@siemens/element-ng/formly';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-test',
  template: `
    <si-formly
      class="si-layout-fixed-height"
      [labelWidth]="250"
      [fields]="fields"
      [model]="model"
      [form]="form"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiTranslateModule, SiFormlyModule]
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields: FormlyFieldConfig[] = [
    {
      type: 'accordion',
      fieldGroup: [
        {
          props: {
            label: 'Personal'
          },
          fieldGroup: [
            {
              key: 'firstname',
              type: 'input',
              props: {
                label: 'First name'
              }
            },
            {
              key: 'lastname',
              type: 'input',
              props: {
                label: 'Last name'
              }
            },
            {
              key: 'email',
              type: 'input',
              props: {
                label: 'Email'
              }
            }
          ]
        },
        {
          props: {
            label: 'Address'
          },
          fieldGroup: [
            {
              key: 'privateAddr',
              type: 'textdisplay',
              props: {
                label: 'Private'
              }
            },
            {
              key: 'businessAddr',
              type: 'textdisplay',
              props: {
                label: 'Business'
              }
            }
          ]
        }
      ]
    }
  ];
  model = {
    firstname: 'John doe',
    lastname: 'Smith',
    email: 'john.doe@example.org',
    businessAddr: 'Sample address of John Doe',
    privateAddr: 'Sample private address of John Doe'
  };
}

describe('formly accordion type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, SiTranslateModule, SiFormlyModule, FormlyTestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  const clickOnHeader = (index: number, element: HTMLElement): void => {
    const headers = element.querySelectorAll('.collapsible-header') as NodeListOf<HTMLElement>;
    headers[index].click();
  };

  it('should have created accordion', () => {
    fixture.detectChanges();
    const accordion = fixture.debugElement.query(By.css('si-accordion'));
    expect(accordion).toBeTruthy();

    const panels = accordion.queryAll(By.css('si-collapsible-panel'));
    expect(panels).toBeTruthy();
    expect(panels.length).toEqual(2);
  });

  it('should update props based on state of panel', () => {
    fixture.detectChanges();

    const fieldGroups = fixture.componentInstance.fields[0].fieldGroup;

    // check if default is open
    if (fieldGroups) {
      expect(fieldGroups[0].props?.opened).toBeTrue();
    }

    clickOnHeader(1, fixture.nativeElement);
    fixture.detectChanges();

    // check if property changes when clicking on panel
    if (fieldGroups) {
      expect(fieldGroups[0].props?.opened).toBeFalse();
      expect(fieldGroups[1].props?.opened).toBeTrue();
    }
  });
});
