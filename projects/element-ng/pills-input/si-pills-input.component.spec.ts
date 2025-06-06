/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SiPillsInputModule } from './si-pills-input.module';

@Component({
  template: `
    <si-pills-input [readonly]="readonly" [(ngModel)]="value" />
    <si-pills-input class="csv" siPillsInputCsv [(ngModel)]="csvValue" />
    <si-pills-input class="email" siPillsInputEmail [(ngModel)]="emailValue" />
  `,
  imports: [SiPillsInputModule, FormsModule]
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
      imports: [SiPillsInputModule, FormsModule, TestHostComponent]
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
    it('should update on enter', fakeAsync(() => {
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      flush();
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      expect(component.value).toEqual(['item-1']);
    }));

    it('should update on blur', fakeAsync(() => {
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      flush();
      inputElement.dispatchEvent(new FocusEvent('blur'));
      flush();
      expect(component.value).toEqual(['item-1']);
    }));

    it('should not update on input', fakeAsync(() => {
      inputElement.value = 'item-1';
      inputElement.dispatchEvent(new InputEvent('input'));
      flush();
      expect(component.value).toEqual([]);
    }));

    it('should update on tag delete', fakeAsync(() => {
      component.value = ['item-1', 'item-2'];
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      componentElement.querySelectorAll<HTMLElement>('.btn-ghost')![1].click();
      expect(component.value).toEqual(['item-1']);
      fixture.detectChanges();
      flush();
      componentElement.querySelector<HTMLElement>('.btn-ghost')!.click();
      expect(component.value).toEqual([]);
    }));

    it('should edit last tag on backspace', fakeAsync(() => {
      component.value = ['item-1', 'item-2'];
      fixture.detectChanges();
      flush();
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'backspace' }));
      fixture.detectChanges();
      flush();
      expect(component.value).toEqual(['item-1']);
      expect(inputElement.value).toEqual('item-2');
    }));

    it('should delete active tag on backspace', fakeAsync(() => {
      component.value = ['item-1', 'item-2'];
      fixture.detectChanges();
      flush();
      componentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowLeft' }));
      fixture.detectChanges();
      flush();
      expect(componentElement.querySelectorAll('si-input-pill')[1]).toHaveClass('active');

      componentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'backspace' }));
      fixture.detectChanges();
      expect(component.value).toEqual(['item-1']);
    }));
  });

  describe('with csv input handler', () => {
    it('should update on input with separator', fakeAsync(() => {
      csvInputElement.value = 'a';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      expect(component.csvValue).toEqual([]);
      csvInputElement.value = 'a,';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      expect(component.csvValue).toEqual(['a']);
    }));

    it('should not include trailing value after separator on input', fakeAsync(() => {
      csvInputElement.value = 'a, b';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      expect(component.csvValue).toEqual(['a']);
    }));

    it('should update on enter', fakeAsync(() => {
      csvInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      csvInputElement.value = 'a, b,c';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      csvInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      expect(component.csvValue).toEqual(['a', 'b', 'c']);
    }));

    it('should update on blur', fakeAsync(() => {
      csvInputElement.value = 'a,b';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      csvInputElement.dispatchEvent(new FocusEvent('blur'));
      flush();
      expect(component.csvValue).toEqual(['a', 'b']);
    }));
  });

  describe('with email input handler', () => {
    it('should update on enter', fakeAsync(() => {
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      emailInputElement.value = 'a';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      emailInputElement.value = 'a@b';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      emailInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'enter' }));
      flush();
      expect(component.emailValue).toEqual(['a@b']);
    }));

    it('should update on blur', fakeAsync(() => {
      emailInputElement.value = 'a@b';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      emailInputElement.dispatchEvent(new FocusEvent('blur'));
      flush();
      expect(component.emailValue).toEqual(['a@b']);
    }));

    it('should update on separator', fakeAsync(() => {
      emailInputElement.value = 'a@b; b@b;invalid';
      emailInputElement.dispatchEvent(new InputEvent('input'));
      flush();
      emailInputElement.dispatchEvent(new FocusEvent('blur'));
      flush();
      expect(component.emailValue).toEqual(['a@b', 'b@b']);
    }));

    it('should not remove pills if readonly', fakeAsync(() => {
      component.value = ['value'];
      component.readonly = true;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      componentElement
        .querySelector('si-input-pill')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'delete' }));
      fixture.detectChanges();
      expect(componentElement.querySelector('si-input-pill')).toBeTruthy();
    }));
  });
});
