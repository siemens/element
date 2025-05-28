/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ComponentRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SiColorPickerComponent as TestComponent } from './index';

@Component({
  template: `<si-color-picker [formControl]="colorPickerControl" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TestComponent]
})
class FormHostComponent {
  readonly colorPickerComp = viewChild.required(TestComponent);
  colorPickerControl = new FormControl('element-data-2');
}

describe('SiColorPickerComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent, FormHostComponent]
    }).compileComponents()
  );

  describe('with direct usage', () => {
    let componentRef: ComponentRef<TestComponent>;
    let fixture: ComponentFixture<TestComponent>;
    let element: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      componentRef = fixture.componentRef;
      componentRef.setInput('color', 'element-data-2');
      element = fixture.nativeElement.querySelector('.input-color-box');
    });

    it('should show color input box', () => {
      expect(element).toBeDefined();
    });

    it('should open color palette', () => {
      element.click();
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('si-color-picker');
      expect(el).toBeDefined();
    });

    it('should have default colors', () => {
      fixture.detectChanges();
      element.click();
      fixture.detectChanges();
      const el = document.querySelector('.colors');
      expect(el).toBeDefined();
      const colorBoxes = el?.querySelectorAll('.color-box');
      expect(colorBoxes?.length).toBe(16);
    });

    it('should be possible to select a color using the keyboard', () => {
      let changedColor: string | undefined;
      fixture.componentInstance.color.subscribe(c => (changedColor = c));

      fixture.detectChanges();
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      const el = document.querySelector('.colors');
      expect(el).toBeDefined();
      const colorBoxes = el?.querySelectorAll('input');
      expect(colorBoxes?.length).toBe(16);
      const firstColorBox = colorBoxes![0] as HTMLElement;
      firstColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(changedColor).toEqual('element-data-1');

      // Traverse to the last when the at the edge
      const lastColorBox = colorBoxes![15] as HTMLElement;
      firstColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(document.activeElement).toBe(lastColorBox);
      lastColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(changedColor).toEqual('element-data-16');

      // Traverse to the first when the at the edge
      lastColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(document.activeElement).toBe(firstColorBox);

      // Check if the arrow down works
      const fifthColorBox = colorBoxes![4] as HTMLElement;
      firstColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(fifthColorBox);
      fifthColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(changedColor).toEqual('element-data-5');

      // Check if arrow up works
      fifthColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(firstColorBox);
    });

    it('should close the overlay on selection if autoClose is enabled', () => {
      componentRef.setInput('autoClose', true);
      let changedColor: string | undefined;
      fixture.componentInstance.color.subscribe(c => (changedColor = c));
      fixture.detectChanges();
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      const el = document.querySelector('.colors');
      const colorBoxes = el?.querySelectorAll('input');
      const firstColorBox = colorBoxes![0] as HTMLElement;
      fixture.detectChanges();
      firstColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(changedColor).toEqual('element-data-1');
      const overlay = document.querySelector('.colors');
      expect(overlay).toBeNull();
    });
  });

  describe('with form', () => {
    let host: FormHostComponent;
    let fixture: ComponentFixture<FormHostComponent>;
    let element: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(FormHostComponent);
      host = fixture.componentInstance;
      element = fixture.nativeElement.querySelector('.input-color-box');
    });

    it('should not mark as dirty if the overlay is opened', () => {
      element.click();
      fixture.detectChanges();
      expect(host.colorPickerControl.dirty).toBeFalse();
    });

    it('should mark as dirty if the input is blurred', () => {
      fixture.detectChanges();
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      const el = document.querySelector('.colors');
      const colorBoxes = el?.querySelectorAll('input');
      const fourthColorBox = colorBoxes![3] as HTMLElement;
      fourthColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(host.colorPickerControl.value).toBe('element-data-4');

      element.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(host.colorPickerControl.dirty).toBeTrue();
    });

    it('should read and write the form value', () => {
      fixture.detectChanges();
      host.colorPickerControl.setValue('element-data-5');
      fixture.detectChanges();
      expect(host.colorPickerComp().color()).toBe('element-data-5');

      fixture.detectChanges();
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      const el = document.querySelector('.colors');
      const colorBoxes = el?.querySelectorAll('input');
      const fourthColorBox = colorBoxes![6] as HTMLElement;
      fourthColorBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(host.colorPickerControl.value).toBe('element-data-7');
    });
  });
});
