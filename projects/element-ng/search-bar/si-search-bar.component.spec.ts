/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, outputBinding, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';

import { SiSearchBarComponent } from './index';

describe('SiSearchBarComponent', () => {
  const getInput = (element: HTMLElement): HTMLInputElement => element.querySelector('input')!;

  describe('as form control', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SiSearchBarComponent;
    let testComponent: TestComponent;
    let element: HTMLElement;

    @Component({
      imports: [ReactiveFormsModule, SiSearchBarComponent],
      template: `<si-search-bar
        [placeholder]="placeholder()"
        [showIcon]="true"
        [formControl]="search"
        [debounceTime]="debounceTime()"
        [prohibitedCharacters]="prohibitedCharacters()"
      />`
    })
    class TestComponent {
      readonly placeholder = signal('Placeholder');
      readonly search = new FormControl('');
      readonly prohibitedCharacters = signal<string | undefined>(undefined);
      readonly debounceTime = signal(0);
      readonly searchBar = viewChild.required(SiSearchBarComponent);
    }

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestComponent);
      testComponent = fixture.componentInstance;
      component = fixture.componentInstance.searchBar();
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('should support custom placeholder', async () => {
      testComponent.placeholder.set('Users');
      await fixture.whenStable();
      expect(getInput(element).placeholder).toBe('Users');
    });

    it('should reset search when clicking cancel button', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.search.setValue('Test1234$');
      await fixture.whenStable();
      element.querySelector<HTMLElement>('button')!.click();
      expect(component.searchChange.emit).toHaveBeenCalledWith('');
    });

    it('should trigger the change event on input', async () => {
      vi.spyOn(component.searchChange, 'emit');
      await userEvent.fill(getInput(element), 'Test1234$');
      await fixture.whenStable();
      expect(component.searchChange.emit).toHaveBeenCalledWith('Test1234$');
    });

    it('should trigger the change event just once per value', async () => {
      vi.spyOn(component.searchChange, 'emit');
      await userEvent.fill(getInput(element), 'CodeTest1234$');
      await fixture.whenStable();
      expect(component.searchChange.emit).toHaveBeenCalledTimes(1);
    });

    it('should not prohibit characters by default', async () => {
      vi.spyOn(component.searchChange, 'emit');
      await userEvent.fill(getInput(element), 'Test1234$');
      await fixture.whenStable();
      expect(component.searchChange.emit).toHaveBeenCalledWith('Test1234$');
    });

    it('should not prohibit characters if string is empty', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters.set('1234$');
      await fixture.whenStable();
      await userEvent.fill(getInput(element), '');
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    });

    it('should not prohibit characters if string is valid', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters.set('1234$');
      await fixture.whenStable();
      await userEvent.fill(getInput(element), 'Test');
      await fixture.whenStable();
      expect(component.searchChange.emit).toHaveBeenCalledWith('Test');
    });

    it('should prohibit characters if string is not valid', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters.set('1234$');
      await fixture.whenStable();
      await userEvent.fill(getInput(element), 'Test1234$');
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    });

    it('should support disable state', async () => {
      testComponent.search.disable();
      await fixture.whenStable();
      expect(getInput(element)).toBeDisabled();
      testComponent.search.enable();
      await fixture.whenStable();
      expect(getInput(element)).toBeEnabled();
    });

    it('should not emit values when changed via form control', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.search.setValue('Initial Value');
      await fixture.whenStable();
      expect(getInput(element).value).toBe('Initial Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();

      testComponent.search.setValue('Updated Value');
      await fixture.whenStable();
      expect(getInput(element).value).toBe('Updated Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('as value input', () => {
    let fixture: ComponentFixture<SiSearchBarComponent>;
    let element: HTMLElement;

    const value = signal<string | undefined>('Initial Value');
    const disabled = signal(false);
    const debounceTime = signal(0);
    const searchChange = vi.fn();

    beforeEach(async () => {
      value.set('Initial Value');
      disabled.set(false);
      debounceTime.set(0);
      searchChange.mockClear();

      fixture = TestBed.createComponent(SiSearchBarComponent, {
        bindings: [
          inputBinding('value', value),
          inputBinding('disabled', disabled),
          inputBinding('debounceTime', debounceTime),
          outputBinding('searchChange', searchChange)
        ]
      });
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('should not emit values when changed via value input', async () => {
      expect(getInput(element).value).toBe('Initial Value');
      expect(searchChange).not.toHaveBeenCalled();

      value.set('Updated Value');
      await fixture.whenStable();
      expect(getInput(element).value).toBe('Updated Value');
      expect(searchChange).not.toHaveBeenCalled();
    });

    it('should support disabled input', async () => {
      disabled.set(true);
      await fixture.whenStable();
      expect(getInput(element)).toBeDisabled();
      disabled.set(false);
      await fixture.whenStable();
      expect(getInput(element)).toBeEnabled();
    });
  });

  describe('debounceTime', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const fakeInput = (text: string, element: HTMLElement): void => {
      const input = getInput(element);
      input.value = text;
      input.dispatchEvent(new Event('input'));
    };

    it('should default to 400ms', () => {
      vi.useFakeTimers();

      const searchChange = vi.fn();
      const fixture = TestBed.createComponent(SiSearchBarComponent, {
        bindings: [outputBinding('searchChange', searchChange)]
      });
      const element: HTMLElement = fixture.nativeElement;
      fixture.detectChanges();

      fakeInput('hello', element);

      vi.advanceTimersByTime(399);
      expect(searchChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(searchChange).toHaveBeenCalledWith('hello');

      vi.useRealTimers();
    });

    it('should respect custom debounceTime', () => {
      vi.useFakeTimers();

      const debounceTime = signal(200);
      const searchChange = vi.fn();
      const fixture = TestBed.createComponent(SiSearchBarComponent, {
        bindings: [
          inputBinding('debounceTime', debounceTime),
          outputBinding('searchChange', searchChange)
        ]
      });
      const element: HTMLElement = fixture.nativeElement;
      fixture.detectChanges();

      fakeInput('world', element);

      vi.advanceTimersByTime(199);
      expect(searchChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(searchChange).toHaveBeenCalledWith('world');

      vi.useRealTimers();
    });
  });
});
