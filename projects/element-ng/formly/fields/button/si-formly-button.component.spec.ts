/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import {
  injectSiTranslateService,
  provideMockTranslateServiceBuilder
} from '@siemens/element-translate-ng/translate';

import { SiFormlyButtonComponent } from './si-formly-button.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields: FormlyFieldConfig[] = [];
  model: any;
  options: FormlyFormOptions = {};

  readonly translate = injectSiTranslateService();

  click(f: string, s: number): void {}
}

describe('formly button type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;
  let translateSpy: jasmine.Spy<(value: any, ...args: any[]) => any>;
  let component: FormlyTestComponent;

  beforeEach(async () => {
    translateSpy = jasmine.createSpy().and.callFake((value: any) => value);
    TestBed.overrideComponent(SiFormlyButtonComponent, {
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
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'btn',
              component: SiFormlyButtonComponent
            }
          ]
        }),
        SiFormlyButtonComponent,
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  it('should have a button of type button', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn'
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    expect(btn.nativeNode.getAttribute('type')).toEqual('button');
  });

  it('should show a label', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          label: 'iam a teapot'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    const elem = btn.nativeElement as HTMLElement;
    expect(elem.innerHTML).toEqual('iam a teapot');
  });

  it('should show a translated label', () => {
    translateSpy.and.returnValue('iam a teapot');
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          label: 'foo.bar'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    const elem = btn.nativeElement as HTMLElement;
    expect(elem.innerHTML).toEqual('iam a teapot');
  });

  it('should handle button btn type default', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {}
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-secondary');
  });

  it('should handle button btn type secondary', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'secondary'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-secondary');
  });

  it('should handle button btn type primary', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'primary'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-primary');
  });

  it('should handle button btn type tertiary', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'tertiary'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-tertiary');
  });

  it('should handle button btn type warning', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'warning'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-warning');
  });

  it('should handle button btn type danger', () => {
    component.fields = [
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'danger'
        }
      }
    ];
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn.classList).toContain('btn');
    expect(btn.classList).toContain('btn-danger');
  });

  describe('with button click', () => {
    let spy: jasmine.Spy<jasmine.Func>;
    beforeEach(() => {
      spy = jasmine.createSpy();
    });

    it('should trigger the clickListener function', fakeAsync(() => {
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: () => spy()
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
    }));

    it('should trigger the clickListener function with custom params', fakeAsync(() => {
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: (f: string, s: number) => spy(f, s),
            clickArgs: ['foo', 42]
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo', 42);
    }));

    it('should trigger the clickListener function by expression', fakeAsync(() => {
      component.options = {
        formState: {
          click: () => spy()
        }
      };
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
    }));

    it('should trigger the clickListener function with custom params', fakeAsync(() => {
      component.options = {
        formState: {
          click: (f: string, s: number) => spy(f, s)
        }
      };
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click',
            clickArgs: ['foo', 42]
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo', 42);
    }));

    it('should trigger the clickListener function with string param', fakeAsync(() => {
      component.options = {
        formState: {
          click: (f: string) => spy(f)
        }
      };
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click',
            clickArgs: 'foo'
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo');
    }));

    it('should trigger the clickListener function with custom params', fakeAsync(() => {
      spyOn(console, 'warn');
      spy.and.throwError('error');
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: () => spy()
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Error while executing dyn ui button "btn" direct click listener.',
        new Error('error')
      );
    }));

    it('should log warning when click listener raised exception', () => {
      spyOn(console, 'warn');
      spy.and.throwError('error');
      component.options = {
        formState: {
          click: () => spy()
        }
      };
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Error while executing dyn ui button "btn" click listener.',
        new Error('error')
      );
    });

    it('should log warning when click listener is not a function', () => {
      spyOn(console, 'warn');
      spy.and.throwError('error');
      component.options = {
        formState: {
          click: 'invalid'
        }
      };
      component.fields = [
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ];
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(console.warn).toHaveBeenCalledWith(
        'The dyn ui button btn has no valid click listener'
      );
    });
  });
});
