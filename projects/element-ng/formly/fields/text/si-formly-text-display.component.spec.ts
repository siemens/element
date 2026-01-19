/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-ng/translate';

import { SiFormlyTextDisplayComponent } from './si-formly-text-display.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly text-display-type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;
  let translateSpy: jasmine.Spy<(value: any, ...args: any[]) => any>;
  let component: FormlyTestComponent;

  beforeEach(() => {
    translateSpy = jasmine.createSpy().and.callFake((value: any) => value);
    TestBed.overrideComponent(SiFormlyTextDisplayComponent, {
      add: {
        providers: [
          provideMockTranslateServiceBuilder(
            () => ({ translate: translateSpy }) as unknown as SiTranslateService
          )
        ]
      }
    });
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        SiFormlyTextDisplayComponent,
        FormlyModule.forRoot({
          types: [
            {
              name: 'textdisplay',
              component: SiFormlyTextDisplayComponent
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

  it('should have a hidden input', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay'
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode.getAttribute('hidden')).toBeDefined();
  });
  it('should have a hidden input containing the model value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay'
      }
    ];
    component.model = {
      name: 'foo'
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode.value).toEqual('foo');
  });
  it('should have a div containing the model value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay'
      }
    ];
    component.model = {
      name: 'foo'
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toEqual('foo');
  });
  it('should render a prefix with value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          prefix: 'thisIsAPrefix'
        }
      }
    ];
    component.model = {
      name: 'foo'
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toMatch(/thisIsAPrefix\s+foo/);
    expect(translateSpy).toHaveBeenCalled();
  });
  it('should render a prefix without value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          prefix: 'thisIsAPrefix'
        }
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toEqual('thisIsAPrefix');
    expect(translateSpy).toHaveBeenCalled();
  });
  it('should render a suffix with value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          suffix: 'thisIsASuffix'
        }
      }
    ];
    component.model = {
      name: 'foo'
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toMatch(/foo\s+thisIsASuffix/);
  });
  it('should render a suffix without value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          suffix: 'thisIsASuffix'
        }
      }
    ];
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toEqual('thisIsASuffix');
  });
  it('should render a suffix without value', () => {
    component.fields = [
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          key: 'this.is.the.path'
        }
      }
    ];
    component.model = {
      name: 'foo',
      this: {
        is: {
          the: {
            path: 'path'
          }
        }
      }
    };
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toEqual('path');
  });
});
