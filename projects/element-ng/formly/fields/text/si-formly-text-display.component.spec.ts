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
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-ng/translate';
import type { Mock } from 'vitest';

import { SiFormlyTextDisplayComponent } from './si-formly-text-display.component';

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

describe('formly text-display-type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;
  let translateSpy: Mock;
  let component: FormlyTestComponent;

  beforeEach(async () => {
    translateSpy = vi.fn().mockImplementation((value: any) => value);
    TestBed.overrideComponent(SiFormlyTextDisplayComponent, {
      add: {
        providers: [
          provideMockTranslateServiceBuilder(
            () => ({ translate: translateSpy }) as unknown as SiTranslateService
          )
        ]
      }
    });
    await TestBed.configureTestingModule({
      imports: [
        SiFormlyTextDisplayComponent,
        FormlyModule.forRoot({
          types: [
            {
              name: 'textdisplay',
              component: SiFormlyTextDisplayComponent
            }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  it('should have a hidden input', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay'
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode.getAttribute('hidden')).toBeDefined();
  });
  it('should have a hidden input containing the model value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay'
      }
    ]);
    component.model.set({
      name: 'foo'
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('input'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeNode.value).toEqual('foo');
  });
  it('should have a div containing the model value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay'
      }
    ]);
    component.model.set({
      name: 'foo'
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement).toHaveTextContent('foo');
  });
  it('should render a prefix with value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          prefix: 'thisIsAPrefix'
        }
      }
    ]);
    component.model.set({
      name: 'foo'
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toMatch(/thisIsAPrefix\s+foo/);
    expect(translateSpy).toHaveBeenCalled();
  });
  it('should render a prefix without value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          prefix: 'thisIsAPrefix'
        }
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement).toHaveTextContent('thisIsAPrefix');
    expect(translateSpy).toHaveBeenCalled();
  });
  it('should render a suffix with value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          suffix: 'thisIsASuffix'
        }
      }
    ]);
    component.model.set({
      name: 'foo'
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement.textContent.trim()).toMatch(/foo\s+thisIsASuffix/);
  });
  it('should render a suffix without value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          suffix: 'thisIsASuffix'
        }
      }
    ]);
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement).toHaveTextContent('thisIsASuffix');
  });
  it('should render a suffix without value', () => {
    component.fields.set([
      {
        key: 'name',
        type: 'textdisplay',
        props: {
          key: 'this.is.the.path'
        }
      }
    ]);
    component.model.set({
      name: 'foo',
      this: {
        is: {
          the: {
            path: 'path'
          }
        }
      }
    });
    fixture.detectChanges();

    const inputField = fixture.debugElement.query(By.css('div'));
    expect(inputField).toBeDefined();
    expect(inputField.nativeElement.textContent).toBeDefined();
    expect(inputField.nativeElement).toHaveTextContent('path');
  });
});
