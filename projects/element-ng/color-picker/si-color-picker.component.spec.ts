/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ComponentRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Locator, page, userEvent } from 'vitest/browser';

import { SiColorPickerComponent as TestComponent } from './index';

@Component({
  imports: [ReactiveFormsModule, TestComponent],
  template: `<si-color-picker [formControl]="colorPickerControl" />`
})
class FormHostComponent {
  readonly colorPickerComp = viewChild.required(TestComponent);
  colorPickerControl = new FormControl('si-sys-color-data-categorical-2');
}

/** Locates the swatch of the n-th default data color. */
const swatch = (n: number): Locator =>
  page.getByRole('gridcell', { name: `si-sys-color-data-categorical-${n}`, exact: true });

describe('SiColorPickerComponent', () => {
  describe('with direct usage', () => {
    let componentRef: ComponentRef<TestComponent>;
    let fixture: ComponentFixture<TestComponent>;
    let element: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      componentRef = fixture.componentRef;
      componentRef.setInput('color', 'si-sys-color-data-categorical-2');
      element = fixture.nativeElement.querySelector('.input-color-box');
    });

    const openWithKeyboard = async (): Promise<void> => {
      await fixture.whenStable();
      element.focus();
      await userEvent.keyboard('{ArrowDown}');
    };

    it('should show color input box', () => {
      expect(element).toBeDefined();
    });

    it('should use color as aria-label when ariaLabel input is not set', async () => {
      await fixture.whenStable();
      expect(element.getAttribute('aria-label')).toBe(
        'Selected color si-sys-color-data-categorical-2'
      );
    });

    it('should use translated ariaLabel with color param when ariaLabel is set', async () => {
      componentRef.setInput('ariaLabel', 'Color picker {{color}}');
      await fixture.whenStable();
      expect(element.getAttribute('aria-label')).toBe(
        'Color picker si-sys-color-data-categorical-2'
      );
    });

    it('should open color palette', () => {
      element.click();
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('si-color-picker');
      expect(el).toBeDefined();
    });

    it('should announce the palette popup and whether it is open on the color input', async () => {
      await fixture.whenStable();
      expect(element).toHaveAttribute('aria-haspopup', 'grid');
      expect(element).toHaveAttribute('aria-expanded', 'false');
      expect(element).not.toHaveAttribute('aria-controls');

      element.click();
      await fixture.whenStable();
      const palette = page.getByRole('grid').element();
      expect(palette.id).not.toBe('');
      expect(element).toHaveAttribute('aria-expanded', 'true');
      expect(element).toHaveAttribute('aria-controls', palette.id);

      await expect.element(swatch(2)).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(element).toHaveAttribute('aria-expanded', 'false');
      expect(element).not.toHaveAttribute('aria-controls');
    });

    it('should name the palette with colorPaletteAriaLabel', async () => {
      element.click();
      await fixture.whenStable();
      await expect
        .element(page.getByRole('grid', { name: 'Color palette', exact: true }))
        .toBeInTheDocument();

      componentRef.setInput('colorPaletteAriaLabel', 'Background color palette');
      await fixture.whenStable();

      await expect
        .element(page.getByRole('grid', { name: 'Background color palette', exact: true }))
        .toBeInTheDocument();
    });

    it('should show the default colors in rows of four', async () => {
      element.click();
      await fixture.whenStable();

      const rows = page.getByRole('row').all();
      expect(rows).toHaveLength(4);
      for (const row of rows) {
        expect(row.getByRole('gridcell').elements()).toHaveLength(4);
      }
    });

    it('should focus the first color when opened without a selection', async () => {
      componentRef.setInput('color', undefined);
      await openWithKeyboard();

      await expect.element(swatch(1)).toHaveFocus();
    });

    it('should move the focus with the arrow keys', async () => {
      await openWithKeyboard();
      await expect.element(swatch(2)).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect.element(swatch(6)).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}{ArrowRight}');
      await expect.element(swatch(8)).toHaveFocus();
      // At the end of a row, the focus continues in the next row.
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(swatch(9)).toHaveFocus();
    });

    it('should select the focused color with Enter and Space', async () => {
      await openWithKeyboard();
      await expect.element(swatch(2)).toHaveFocus();

      await userEvent.keyboard('{ArrowRight}');
      await expect.element(swatch(3)).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(componentRef.instance.color()).toBe('si-sys-color-data-categorical-3');

      await userEvent.keyboard('{ArrowRight}');
      await expect.element(swatch(4)).toHaveFocus();
      await userEvent.keyboard(' ');
      expect(componentRef.instance.color()).toBe('si-sys-color-data-categorical-4');

      await fixture.whenStable();
      expect(swatch(4).element()).toHaveAttribute('aria-selected', 'true');
      expect(swatch(3).element()).toHaveAttribute('aria-selected', 'false');
      expect(swatch(2).element()).toHaveAttribute('aria-selected', 'false');
    });

    it('should close the overlay on selection if autoClose is enabled', async () => {
      componentRef.setInput('autoClose', true);
      await openWithKeyboard();
      await expect.element(swatch(2)).toHaveFocus();

      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(swatch(1)).toHaveFocus();
      await userEvent.keyboard('{Enter}');

      expect(componentRef.instance.color()).toBe('si-sys-color-data-categorical-1');
      await expect.element(page.getByRole('grid')).not.toBeInTheDocument();
      await expect.element(element).toHaveFocus();
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
      expect(host.colorPickerControl.dirty).toBe(false);
    });

    it('should mark as dirty when a color is selected', async () => {
      element.click();
      await fixture.whenStable();
      await userEvent.click(swatch(4));
      expect(host.colorPickerControl.value).toBe('si-sys-color-data-categorical-4');
      expect(host.colorPickerControl.dirty).toBe(true);
    });

    it('should keep the form untouched when the selected color is chosen again', async () => {
      const valueChanges = vi.fn();
      host.colorPickerControl.valueChanges.subscribe(valueChanges);
      const expectUnchanged = async (): Promise<void> => {
        await fixture.whenStable();
        expect(swatch(2).element()).toHaveAttribute('aria-selected', 'true');
        expect(host.colorPickerControl.value).toBe('si-sys-color-data-categorical-2');
        expect(host.colorPickerControl.pristine).toBe(true);
        expect(valueChanges).not.toHaveBeenCalled();
      };
      await fixture.whenStable();
      element.focus();
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(swatch(2)).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      await expectUnchanged();

      await userEvent.click(swatch(2));
      await expectUnchanged();
    });

    it('should clear the preview background when the form value is emptied', async () => {
      await fixture.whenStable();
      const preview = element.querySelector<HTMLElement>('.inside-box')!;
      expect(preview.style).toHaveProperty(
        'backgroundColor',
        'var(--si-sys-color-data-categorical-2)'
      );

      host.colorPickerControl.setValue('');
      await fixture.whenStable();

      expect(preview.style).toHaveProperty('backgroundColor', '');
    });

    it('should read and write the form value', async () => {
      host.colorPickerControl.setValue('si-sys-color-data-categorical-5');
      await fixture.whenStable();
      expect(host.colorPickerComp().color()).toBe('si-sys-color-data-categorical-5');

      element.click();
      await fixture.whenStable();
      expect(swatch(5).element()).toHaveAttribute('aria-selected', 'true');

      const valueChanges = vi.fn();
      host.colorPickerControl.valueChanges.subscribe(valueChanges);
      await userEvent.click(swatch(7));
      expect(host.colorPickerControl.value).toBe('si-sys-color-data-categorical-7');
      expect(valueChanges).toHaveBeenCalledExactlyOnceWith('si-sys-color-data-categorical-7');
    });
  });
});
