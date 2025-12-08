/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SiPillsInputModule } from './si-pills-input.module';

@Component({
  imports: [SiPillsInputModule, FormsModule],
  template: `
    <si-pills-input [readonly]="readonly" [(ngModel)]="value" />
    <si-pills-input class="csv" siPillsInputCsv [(ngModel)]="csvValue" />
    <si-pills-input class="email" siPillsInputEmail [(ngModel)]="emailValue" />
  `
})
class TestHostComponent {
  showVisibilityIcon = true;
  value: string[] = [];
  csvValue: string[] = [];
  emailValue: string[] = [];
  readonly = false;
}

describe('SiPillsInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;
  let componentElement: HTMLElement;
  let inputElement: HTMLInputElement;
  let csvComponentElement: HTMLElement;
  let csvInputElement: HTMLInputElement;
  let emailComponentElement: HTMLElement;
  let emailInputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiPillsInputModule, FormsModule, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
    componentElement = element.querySelector('si-pills-input')!;
    inputElement = componentElement.querySelector('input')!;
    csvComponentElement = element.querySelector('si-pills-input.csv')!;
    csvInputElement = csvComponentElement.querySelector('input')!;
    emailComponentElement = element.querySelector('si-pills-input.email')!;
    emailInputElement = emailComponentElement.querySelector('input')!;
  });

  describe('with no input-handler', () => {
    it('should update on enter', async () => {
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      expect(component.value).toEqual(['item-1']);
    });

    it('should update on blur', async () => {
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      inputElement.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(component.value).toEqual(['item-1']);
    });

    it('should not update on input', async () => {
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      expect(component.value).toEqual([]);
    });

    it('should update on tag delete', async () => {
      component.value = ['item-1', 'item-2'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      componentElement.querySelectorAll<HTMLElement>('.btn-ghost')![1].click();
      expect(component.value).toEqual(['item-1']);
      fixture.detectChanges();
      await fixture.whenStable();
      componentElement.querySelector<HTMLElement>('.btn-ghost')!.click();
      expect(component.value).toEqual([]);
    });

    it('should edit last tag on backspace', async () => {
      component.value = ['item-1', 'item-2'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'backspace' }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.value).toEqual(['item-1']);
      expect(inputElement.value).toEqual('item-2');
    });

    it('should delete active tag on backspace', async () => {
      component.value = ['item-1', 'item-2'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      componentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowLeft' }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(componentElement.querySelectorAll('si-input-pill')[1]).toHaveClass('active');

      componentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'backspace' }));
      fixture.detectChanges();
      expect(component.value).toEqual(['item-1']);
    });
  });

  describe('with csv input handler', () => {
    it('should update on input with separator', async () => {
      csvInputElement.value = 'a';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      expect(component.csvValue).toEqual([]);
      csvInputElement.value = 'a,';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      expect(component.csvValue).toEqual(['a']);
    });

    it('should not include trailing value after separator on input', async () => {
      csvInputElement.value = 'a, b';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      expect(component.csvValue).toEqual(['a']);
    });

    it('should update on enter', async () => {
      csvInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      csvInputElement.value = 'a, b,c';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      csvInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      expect(component.csvValue).toEqual(['a', 'b', 'c']);
    });

    it('should update on blur', async () => {
      jasmine.clock().install();
      csvInputElement.value = 'a,b';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      jasmine.clock().tick(100);
      csvInputElement.dispatchEvent(new InputEvent('input'));
      csvInputElement.dispatchEvent(new FocusEvent('blur'));
      jasmine.clock().tick(500);
      await fixture.whenStable();
      jasmine.clock().uninstall();
      expect(component.csvValue).toEqual(['a', 'b']);
    });
  });

  describe('with email input handler', () => {
    it('should update on enter', async () => {
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      emailInputElement.value = 'a';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      emailInputElement.value = 'a@b';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      await fixture.whenStable();
      expect(component.emailValue).toEqual(['a@b']);
    });

    it('should update on blur', async () => {
      emailInputElement.value = 'a@b';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      emailInputElement.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(component.emailValue).toEqual(['a@b']);
    });

    it('should update on separator', async () => {
      emailInputElement.value = 'a@b; b@b;invalid';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      emailInputElement.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(component.emailValue).toEqual(['a@b', 'b@b']);
    });

    it('should not remove pills if readonly', async () => {
      component.value = ['value'];
      component.readonly = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      componentElement
        .querySelector('si-input-pill')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'delete' }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(componentElement.querySelector('si-input-pill')).toBeTruthy();
    });
  });
});
