/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DebugElement, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { SiIp6InputDirective } from './si-ip6-input.directive';

@Component({
  imports: [FormsModule, SiIp6InputDirective],
  template: `<input
    #validation="ngModel"
    siIpV6
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

describe('SiIp6InputDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let debugElement: DebugElement;
  let input: HTMLInputElement;

  const typeInput = (i: string): void => {
    input.value = '';
    for (const c of i) {
      input.value += c;
      input.dispatchEvent(new InputEvent('input', { data: c, inputType: 'insertText' }));
    }
  };

  const pasteInput = (i: string): void => {
    input.value = i;
    input.dispatchEvent(new InputEvent('input', { data: i, inputType: 'insertFromPaste' }));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    });
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    input = debugElement.query(By.directive(SiIp6InputDirective)).nativeElement;
    fixture.detectChanges();
  });

  it('should be valid', () => {
    [
      '1:2:3:4:5:6:7:8',
      '1::',
      '1:2:3:4:5:6:7::',
      '1::8',
      '1:2:3:4:5:6::8',
      '1::7:8',
      '1:2:3:4:5::7:8',
      '1:2:3:4:5::8',
      '1::6:7:8',
      '1:2:3:4::6:7:8',
      '1:2:3:4::8',
      '1::5:6:7:8',
      '1:2:3::5:6:7:8',
      '1:2:3::8',
      '1::4:5:6:7:8',
      '1:2::4:5:6:7:8  1:2::8',
      '1::3:4:5:6:7:8',
      '1::3:4:5:6:7:8',
      '1::8'
    ].forEach(i => {
      typeInput(i);
      input.blur();
      fixture.detectChanges();
      expect(component.validation().errors).toBeFalsy();
    });
  });

  it('should be invalid', () => {
    ['::1111::1/', '::1111::1/1', '::1111::1/128'].forEach(i => {
      fixture.detectChanges();
      // Skip masking otherwise multiple occurrences of :: will be dropped
      input.value = i;
      input.blur();
      fixture.detectChanges();
      expect(input.value).toEqual(i);
      expect(component.validation().errors).toBeTruthy();
    });
  });

  it('should transform input', () => {
    [
      { /* Only one compressor marker is allowed */ input: '::1::1', output: '::1:1' },
      { /* Drop unsupported characters */ input: '::1+-*G:1', output: '::1:1' }
    ].forEach(i => {
      typeInput(i.input);
      expect(component.address()).toEqual(i.output ?? i.input);
    });
  });

  it('should transform paste', () => {
    [
      { /* Only one compressor marker is allowed */ input: '::1::1', output: '::1:1' },
      { /* Drop unsupported characters */ input: '::1+-*G:1', output: '::1:1' },
      {
        /* Automatically insert colons every time the number of hex values is higher 4 */
        input: '12341234123412341234123412341234',
        output: '1234:1234:1234:1234:1234:1234:1234:1234'
      }
    ].forEach(i => {
      pasteInput(i.input);
      expect(component.address()).toEqual(i.output ?? i.input);
    });
  });

  describe('with CIDR', () => {
    beforeEach(() => {
      component.cidr.set(true);
      fixture.detectChanges();
    });

    it('should transform paste', () => {
      [
        {
          /* Automatically insert colons and slash every time the number of hex values is higher 4 */
          input: '12341234123412341234123412341234123',
          output: '1234:1234:1234:1234:1234:1234:1234:1234/123'
        },
        {
          /* Automatically drop numbers larger 128 for CIDR section */
          input: '12341234123412341234123412341234129',
          output: '1234:1234:1234:1234:1234:1234:1234:1234/12'
        },
        {
          /* Automatically append CIDR section divider */
          input: '1234:1234:1234:1234:1234:1234:1234:12341',
          output: '1234:1234:1234:1234:1234:1234:1234:1234/1'
        }
      ].forEach(i => {
        pasteInput(i.input);
        expect(component.address()).toEqual(i.output ?? i.input);
      });
    });

    it('should be valid on input', () => {
      ['2001::8:800:200C:417A/1', '2001:DB8::8:800:200C:417A/128'].forEach(i => {
        typeInput(i);
        input.blur();
        fixture.detectChanges();
        expect(input.value).toEqual(i);
        expect(component.validation().errors).toBeFalsy();
      });
    });

    it('should be invalid', () => {
      ['2001::8:800:200C:417A/129'].forEach(i => {
        // Deactivate masking otherwise multiple occurrences of :: we be dropped
        fixture.detectChanges();
        typeInput(i);
        input.blur();
        fixture.detectChanges();
        expect(input.value).toEqual(i);
        expect(component.validation().errors).toBeTruthy();
      });
    });
  });
});
