/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';

import { SiFormlyIpInputComponent } from './si-formly-ip-input.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: `<formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly ip', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'ipv4',
              component: SiFormlyIpInputComponent
            },
            {
              name: 'ipv6',
              component: SiFormlyIpInputComponent
            }
          ]
        }),
        SiFormlyIpInputComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should display IPv4 address - as data value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'addr',
        type: 'ipv4'
      }
    ];
    componentInstance.model = {
      addr: '192.168.0.1'
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeElement.value).toEqual('192.168.0.1');
  });

  it('should display IPv4 address with CIDR notation - as data value', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'addr',
        type: 'ipv4',
        props: {
          cidr: true
        }
      }
    ];
    componentInstance.model = {
      addr: '192.168.0.1/32'
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeElement.value).toEqual('192.168.0.1/32');
  }));

  it('should display IPv6 address - as data value', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'addr',
        type: 'ipv6'
      }
    ];
    componentInstance.model = {
      addr: '2001:DB8::8:800:200C:417A'
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeElement.value).toEqual('2001:DB8::8:800:200C:417A');
  });

  it('should display IPv6 address with CIDR notation - as data value', fakeAsync(() => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'addr',
        type: 'ipv6',
        props: {
          cidr: true
        }
      }
    ];
    componentInstance.model = {
      addr: '2001:DB8::8:800:200C:417A/128'
    };
    fixture.detectChanges();
    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField.nativeElement.value).toEqual('2001:DB8::8:800:200C:417A/128');
  }));
});
