/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import {
  injectSiTranslateService,
  provideMockTranslateServiceBuilder
} from '@siemens/element-translate-ng/translate';
import type { Mock } from 'vitest';

import { SiFormlyButtonComponent } from './si-formly-button.component';

@Component({
  selector: 'si-formly-test',
  imports: [FormlyModule],
  template: `<formly-form
    [form]="form"
    [fields]="fields()"
    [model]="model()"
    [options]="options()"
  /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  readonly form = new FormRecord({});
  readonly fields = signal<FormlyFieldConfig[]>([]);
  readonly model = signal<any>({});
  readonly options = signal<FormlyFormOptions>({});

  readonly translate = injectSiTranslateService();
}

describe('formly button type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;
  let translateSpy: Mock;
  let component: FormlyTestComponent;

  beforeEach(async () => {
    translateSpy = vi.fn().mockImplementation((value: any) => value);
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
        FormlyModule.forRoot({
          types: [
            {
              name: 'btn',
              component: SiFormlyButtonComponent
            }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyTestComponent);
    component = fixture.componentInstance;
  });

  it('should have a button of type button', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn'
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    expect(btn.nativeNode).toHaveAttribute('type', 'button');
  });

  it('should show a label', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          label: 'iam a teapot'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    const elem = btn.nativeElement as HTMLElement;
    expect(elem).toHaveTextContent('iam a teapot');
  });

  it('should show a translated label', () => {
    translateSpy.mockReturnValue('iam a teapot');
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          label: 'foo.bar'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeDefined();
    const elem = btn.nativeElement as HTMLElement;
    expect(elem).toHaveTextContent('iam a teapot');
  });

  it('should handle button btn type default', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {}
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-secondary');
  });

  it('should handle button btn type secondary', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'secondary'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-secondary');
  });

  it('should handle button btn type primary', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'primary'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeNode;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-primary');
  });

  it('should handle button btn type tertiary', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'tertiary'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-tertiary');
  });

  it('should handle button btn type warning', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'warning'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-warning');
  });

  it('should handle button btn type danger', () => {
    component.fields.set([
      {
        key: 'btn',
        type: 'btn',
        props: {
          btnType: 'danger'
        }
      }
    ]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveClass('btn-danger');
  });

  describe('with button click', () => {
    let spy: Mock;
    beforeEach(() => {
      spy = vi.fn();
    });

    it('should trigger the clickListener function', () => {
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: () => spy()
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
    });

    it('should trigger the clickListener function with custom params', () => {
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: (f: string, s: number) => spy(f, s),
            clickArgs: ['foo', 42]
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo', 42);
    });

    it('should trigger the clickListener function by expression', () => {
      component.options.set({
        formState: {
          click: () => spy()
        }
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
    });

    it('should trigger the clickListener function with custom params', () => {
      component.options.set({
        formState: {
          click: (f: string, s: number) => spy(f, s)
        }
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click',
            clickArgs: ['foo', 42]
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo', 42);
    });

    it('should trigger the clickListener function with string param', () => {
      component.options.set({
        formState: {
          click: (f: string) => spy(f)
        }
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click',
            clickArgs: 'foo'
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalledWith('foo');
    });

    it('should trigger the clickListener function with custom params', () => {
      vi.spyOn(console, 'warn');
      spy.mockImplementation(() => {
        throw new Error('error');
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: () => spy()
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Error while executing dyn ui button "btn" direct click listener.',
        new Error('error')
      );
    });

    it('should log warning when click listener raised exception', () => {
      vi.spyOn(console, 'warn');
      spy.mockImplementation(() => {
        throw new Error('error');
      });
      component.options.set({
        formState: {
          click: () => spy()
        }
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(spy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Error while executing dyn ui button "btn" click listener.',
        new Error('error')
      );
    });

    it('should log warning when click listener is not a function', () => {
      vi.spyOn(console, 'warn');
      spy.mockImplementation(() => {
        throw new Error('error');
      });
      component.options.set({
        formState: {
          click: 'invalid'
        }
      });
      component.fields.set([
        {
          key: 'btn',
          type: 'btn',
          props: {
            clickListener: 'formState.click'
          }
        }
      ]);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(console.warn).toHaveBeenCalledWith(
        'The dyn ui button btn has no valid click listener'
      );
    });
  });
});
