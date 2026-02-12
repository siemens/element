/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DebugElement, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { SiIp4InputDirective } from './si-ip4-input.directive';

@Component({
  imports: [FormsModule, SiIp4InputDirective],
  template: `<input
    #validation="ngModel"
    siIpV4
    type="text"
    class="form-control"
    [cidr]="cidr()"
    [ngModel]="address()"
    (ngModelChange)="address.set($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly validation = viewChild.required<NgControl>('validation');
  readonly address = signal<string | null>(null);
  readonly cidr = signal(false);
}

describe('SiIp4InputDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let debugElement: DebugElement;
  let input: HTMLInputElement;

  const typeInput = (i: string): void => {
    for (const c of i) {
      input.value += c;
      input.dispatchEvent(new InputEvent('input', { data: c, inputType: 'insertText' }));
    }
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    input = debugElement.query(By.directive(SiIp4InputDirective)).nativeElement;
    fixture.detectChanges();
  });

  it('should be valid on input', () => {
    ['255.255.255.255', '1.0.0.0'].forEach(i => {
      input.value = '';
      typeInput(i);
      input.blur();
      fixture.detectChanges();
      expect(input.value).toEqual(i);
      expect(component.validation().errors).toBeFalsy();
    });
  });

  it('should be invalid', () => {
    ['1111'].forEach(i => {
      input.value = '';
      typeInput(i);
      input.blur();
      fixture.detectChanges();
      expect(component.validation().errors?.ipv4Address).toBeTruthy();
    });
  });

  it('should transform input', () => {
    [
      { input: '255.255.255.2550', output: '255.255.255.255' },
      { input: '255.255.2550.255', output: '255.255.255.025' },
      { input: '99999999', output: '99.99.99.99' },
      { input: '255999999', output: '255.99.99.99' },
      { input: '2559999990', output: '255.99.99.99' },
      { input: 'abcd255+99-99*99/0', output: '255.99.99.99' }
    ].forEach(i => {
      input.value = '';
      typeInput(i.input);
      expect(component.address()).toEqual(i.output ?? i.input);
    });
  });

  [
    { input: '001.1.01.2', output: '1.1.1.2' },
    { input: '000.1.00.2', output: '0.1.0.2' }
  ].forEach(i => {
    it(`should trim leading ${i.input} zeros on blur`, () => {
      typeInput(i.input);
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(component.address()).toEqual(i.output);
    });
  });

  describe('with CIDR', () => {
    it('should be valid on input', () => {
      ['1.1.1.1/1', '1.1.1.1/32'].forEach(i => {
        input.value = '';
        typeInput(i);
        input.blur();
        fixture.detectChanges();
        expect(component.validation().errors).toBeFalsy();
      });
    });
  });
});
