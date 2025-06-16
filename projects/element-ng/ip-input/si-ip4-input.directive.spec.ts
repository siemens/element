/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DebugElement, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { SiIp4InputDirective } from './si-ip4-input.directive';

@Component({
  template: `<input
    #validation="ngModel"
    siIpV4
    type="text"
    class="form-control"
    [cidr]="cidr()"
    [ngModel]="address()"
    (ngModelChange)="address.set($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SiIp4InputDirective]
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
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    });
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
      { input: '255.255.2550.255', output: '255.255.255.0' },
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
