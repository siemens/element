/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';

import { SiPillsInputModule } from './si-pills-input.module';

@Component({
  imports: [SiPillsInputModule, FormsModule],
  template: `
    <si-pills-input [readonly]="readonly()" [(ngModel)]="value" />
    <si-pills-input class="csv" siPillsInputCsv [(ngModel)]="csvValue" />
    <si-pills-input class="email" siPillsInputEmail [(ngModel)]="emailValue" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly value = signal<string[]>([]);
  readonly csvValue = signal<string[]>([]);
  readonly emailValue = signal<string[]>([]);
  readonly readonly = signal(false);
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
    it('should update on enter', async () => {
      await userEvent.type(inputElement, '{Enter}');
      await userEvent.type(inputElement, 'item-1{Enter}');
      expect(component.value()).toEqual(['item-1']);
    });

    it('should update on blur', async () => {
      await userEvent.type(inputElement, 'item-1{Tab}');
      expect(component.value()).toEqual(['item-1']);
    });

    it('should not update on input', async () => {
      await userEvent.type(inputElement, 'item-1');
      expect(component.value()).toEqual([]);
    });

    it('should update on tag delete', async () => {
      component.value.set(['item-1', 'item-2']);
      await fixture.whenStable();

      componentElement.querySelectorAll<HTMLElement>('.btn-tertiary-ghost')![1].click();
      expect(component.value()).toEqual(['item-1']);
      await fixture.whenStable();
      componentElement.querySelector<HTMLElement>('.btn-tertiary-ghost')!.click();
      expect(component.value()).toEqual([]);
    });

    it('should edit last tag on backspace', async () => {
      component.value.set(['item-1', 'item-2']);
      await fixture.whenStable();
      await userEvent.type(inputElement, '{backspace}');

      expect(component.value()).toEqual(['item-1']);
      expect(inputElement.value).toEqual('item-2');
    });

    it('should delete active tag on backspace', async () => {
      component.value.set(['item-1', 'item-2']);
      await fixture.whenStable();
      await userEvent.type(inputElement, '{arrowleft}');

      expect(componentElement.querySelectorAll('si-input-pill')[1]).toHaveClass('active');
      await userEvent.type(inputElement, '{backspace}');
      expect(component.value()).toEqual(['item-1']);
    });
  });

  describe('with csv input handler', () => {
    it('should update on input with separator', async () => {
      await userEvent.type(csvInputElement, 'a');
      expect(component.csvValue()).toEqual([]);
      await userEvent.type(csvInputElement, ',');
      await fixture.whenStable();
      expect(component.csvValue()).toEqual(['a']);
    });

    it('should not include trailing value after separator on input', async () => {
      csvInputElement.value = 'a, b';
      csvInputElement.dispatchEvent(new InputEvent('input'));
      await fixture.whenStable();
      expect(component.csvValue()).toEqual(['a']);
    });

    it('should update on enter', async () => {
      await userEvent.type(csvInputElement, '{Enter}');
      await userEvent.type(csvInputElement, 'a, b,c{Enter}');
      expect(component.csvValue()).toEqual(['a', 'b', 'c']);
    });

    it('should update on blur', async () => {
      await userEvent.type(csvInputElement, 'a, b{Tab}');
      expect(component.csvValue()).toEqual(['a', 'b']);
    });
  });

  describe('with email input handler', () => {
    it('should update on enter', async () => {
      await userEvent.type(emailInputElement, '{Enter}');
      await userEvent.type(emailInputElement, 'a{Enter}@b{Enter}');
      expect(component.emailValue()).toEqual(['a@b']);
    });

    it('should update on blur', async () => {
      await userEvent.type(emailInputElement, 'a@b{Tab}');
      expect(component.emailValue()).toEqual(['a@b']);
    });

    it('should update on separator', async () => {
      await userEvent.type(emailInputElement, 'a@b; b@b;invalid{Tab}');
      expect(component.emailValue()).toEqual(['a@b', 'b@b']);
    });

    it('should not remove pills if readonly', async () => {
      component.value.set(['value']);
      component.readonly.set(true);
      await fixture.whenStable();
      fixture.detectChanges();
      componentElement
        .querySelector('si-input-pill')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'delete' }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(componentElement.querySelector('si-input-pill')).toBeInTheDocument();
    });
  });
});
