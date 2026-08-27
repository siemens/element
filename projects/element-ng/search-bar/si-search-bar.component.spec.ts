/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, outputBinding, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { disabled as disabledRule, form, FormField, maxLength } from '@angular/forms/signals';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';
import { userEvent } from 'vitest/browser';

import { SiSearchBarComponent, SiSearchBarInputDirective } from './index';

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

    it('should reset search and focus input when clicking cancel button', async () => {
      vi.spyOn(component.searchChange, 'emit');
      testComponent.search.setValue('Test1234$');
      await fixture.whenStable();
      await userEvent.click(element.querySelector<HTMLElement>('button')!);
      await fixture.whenStable();
      expect(component.searchChange.emit).toHaveBeenCalledWith('');
      await expect.element(getInput(element)).toHaveFocus();
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

  describe('with projected input', () => {
    it('should disable and enable a projected signal form input', async () => {
      @Component({
        imports: [FormField, SiSearchBarComponent, SiSearchBarInputDirective],
        template: `
          <si-search-bar>
            <input siSearchBarInput aria-label="Search" [formField]="search" />
          </si-search-bar>
        `
      })
      class DisabledSignalInputTestComponent {
        readonly model = signal('Search term');
        readonly disable = signal(false);
        readonly search = form(this.model, path =>
          disabledRule(path, { when: () => this.disable() })
        );
      }

      const fixture = TestBed.createComponent(DisabledSignalInputTestComponent);
      await fixture.whenStable();
      const input = getInput(fixture.nativeElement);
      expect(input).toBeEnabled();

      fixture.componentInstance.disable.set(true);
      await fixture.whenStable();
      expect(input).toBeDisabled();
      expect(fixture.nativeElement.querySelector('button')).toBeDisabled();

      fixture.componentInstance.disable.set(false);
      await fixture.whenStable();
      expect(input).toBeEnabled();
      expect(fixture.nativeElement.querySelector('button')).toBeEnabled();
    });

    it('should update icon-end for programmatic reactive form changes', async () => {
      @Component({
        imports: [ReactiveFormsModule, SiSearchBarInputDirective],
        template: `<input siSearchBarInput aria-label="Search" [formControl]="search" />`
      })
      class ReactiveInputTestComponent {
        readonly search = new FormControl('', { nonNullable: true });
      }

      const fixture = TestBed.createComponent(ReactiveInputTestComponent);
      await fixture.whenStable();
      const input = getInput(fixture.nativeElement);
      expect(input).not.toHaveClass('icon-end');

      fixture.componentInstance.search.setValue('Search term');
      await fixture.whenStable();
      expect(input).toHaveClass('icon-end');

      fixture.componentInstance.search.reset();
      await fixture.whenStable();
      expect(input).not.toHaveClass('icon-end');
    });

    it('should update icon-end for programmatic signal form changes', async () => {
      @Component({
        imports: [FormField, SiSearchBarInputDirective],
        template: `<input siSearchBarInput aria-label="Search" [formField]="search" />`
      })
      class SignalInputTestComponent {
        readonly model = signal('');
        readonly search = form(this.model);
      }

      const fixture = TestBed.createComponent(SignalInputTestComponent);
      await fixture.whenStable();
      const input = getInput(fixture.nativeElement);
      expect(input).not.toHaveClass('icon-end');

      fixture.componentInstance.model.set('Search term');
      await fixture.whenStable();
      expect(input).toHaveClass('icon-end');

      fixture.componentInstance.model.set('');
      await fixture.whenStable();
      expect(input).not.toHaveClass('icon-end');
    });

    it('should apply icon-end only when the native input has a value', async () => {
      @Component({
        imports: [SiSearchBarInputDirective],
        template: `<input siSearchBarInput aria-label="Search" value="Initial value" />`
      })
      class NativeInputTestComponent {}

      const fixture = TestBed.createComponent(NativeInputTestComponent);
      await fixture.whenStable();
      const input = getInput(fixture.nativeElement);
      expect(input).toHaveClass('icon-end');

      await userEvent.fill(input, '');
      await fixture.whenStable();
      expect(input).not.toHaveClass('icon-end');

      await userEvent.fill(input, 'Search term');
      await fixture.whenStable();
      expect(input).toHaveClass('icon-end');
    });

    it('should display the initial value of a projected input form control', async () => {
      @Component({
        imports: [ReactiveFormsModule, SiSearchBarComponent, SiSearchBarInputDirective],
        template: `
          <si-search-bar>
            <input siSearchBarInput aria-label="Search" [formControl]="search" />
          </si-search-bar>
        `
      })
      class InitialValueTestComponent {
        readonly search = new FormControl('hello123', { nonNullable: true });
      }

      const fixture = TestBed.createComponent(InitialValueTestComponent);
      await fixture.whenStable();

      expect(getInput(fixture.nativeElement).value).toBe('hello123');
      expect(getInput(fixture.nativeElement)).toHaveClass('icon-end');
      expect(fixture.nativeElement.querySelector('button')).not.toBeNull();

      fixture.componentInstance.search.setValue('Updated value');
      await fixture.whenStable();
      expect(getInput(fixture.nativeElement).value).toBe('Updated value');

      await userEvent.click(fixture.nativeElement.querySelector('button')!);
      await fixture.whenStable();
      expect(fixture.componentInstance.search.value).toBe('');
      expect(getInput(fixture.nativeElement).value).toBe('');
      expect(getInput(fixture.nativeElement)).not.toHaveClass('icon-end');
    });

    it('should display the initial value of a projected signal form field', async () => {
      @Component({
        imports: [FormField, SiSearchBarComponent, SiSearchBarInputDirective],
        template: `
          <si-search-bar>
            <input siSearchBarInput aria-label="Search" [formField]="search" />
          </si-search-bar>
        `
      })
      class InitialSignalValueTestComponent {
        readonly model = signal('hello123');
        readonly search = form(this.model);
      }

      const fixture = TestBed.createComponent(InitialSignalValueTestComponent);
      await fixture.whenStable();

      expect(getInput(fixture.nativeElement).value).toBe('hello123');
      expect(fixture.nativeElement.querySelector('button')).not.toBeNull();

      fixture.componentInstance.model.set('Updated value');
      await fixture.whenStable();
      expect(getInput(fixture.nativeElement).value).toBe('Updated value');
    });

    it('should clear validation errors on a projected signal form field', async () => {
      @Component({
        imports: [FormField, SiSearchBarComponent, SiSearchBarInputDirective, SiTypeaheadDirective],
        template: `
          <si-search-bar [debounceTime]="0">
            <input
              siSearchBarInput
              aria-label="States"
              [formField]="search"
              [siTypeahead]="['California']"
            />
          </si-search-bar>
        `
      })
      class SignalInputTestComponent {
        readonly model = signal('California');
        readonly search = form(this.model, path => maxLength(path, 5));
      }

      const fixture = TestBed.createComponent(SignalInputTestComponent);
      await fixture.whenStable();
      const element: HTMLElement = fixture.nativeElement;
      const input = getInput(element);
      input.value = 'California';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      expect(fixture.componentInstance.search().invalid()).toBe(true);

      await userEvent.click(element.querySelector<HTMLButtonElement>('button')!);
      await fixture.whenStable();

      expect(fixture.componentInstance.model()).toBe('');
      expect(fixture.componentInstance.search().errors()).toHaveLength(0);
      expect(input.value).toBe('');
      expect(input).toHaveFocus();
      expect(element.querySelector('button')).toBeNull();
    });

    it('should clear validation errors on a projected input form control', async () => {
      @Component({
        imports: [ReactiveFormsModule, SiSearchBarComponent, SiSearchBarInputDirective],
        template: `
          <si-search-bar [debounceTime]="0">
            <input siSearchBarInput aria-label="States" [formControl]="search" />
          </si-search-bar>
        `
      })
      class InputControlTestComponent {
        readonly search = new FormControl('', Validators.maxLength(5));
      }

      const fixture = TestBed.createComponent(InputControlTestComponent);
      await fixture.whenStable();
      const element: HTMLElement = fixture.nativeElement;
      const input = getInput(element);
      await userEvent.fill(input, 'California');
      await fixture.whenStable();
      expect(fixture.componentInstance.search.hasError('maxlength')).toBe(true);

      await userEvent.click(element.querySelector<HTMLButtonElement>('button')!);
      await fixture.whenStable();

      expect(fixture.componentInstance.search.value).toBe('');
      expect(fixture.componentInstance.search.errors).toBeNull();
      expect(input.value).toBe('');
      expect(input).toHaveFocus();
    });

    @Component({
      imports: [ReactiveFormsModule, SiSearchBarComponent, SiSearchBarInputDirective],
      template: `
        <si-search-bar
          placeholder="Ignored placeholder"
          value="Ignored value"
          [showIcon]="true"
          [readonly]="true"
          [disabled]="true"
          [maxlength]="1"
          [debounceTime]="0"
        >
          <input
            class="projected-input"
            siSearchBarInput
            aria-label="Projected search"
            [formControl]="search"
            [placeholder]="placeholder()"
            [readonly]="readonly()"
            [disabled]="disabled()"
            [maxlength]="12"
          />
        </si-search-bar>
      `
    })
    class ProjectedInputTestComponent {
      readonly placeholder = signal('Search users');
      readonly readonly = signal(false);
      readonly disabled = signal(false);
      readonly search = new FormControl('Initial value');
    }

    let fixture: ComponentFixture<ProjectedInputTestComponent>;
    let testComponent: ProjectedInputTestComponent;
    let element: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(ProjectedInputTestComponent);
      testComponent = fixture.componentInstance;
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('should use the projected input instead of the default input', () => {
      const input = getInput(element);

      expect(element.querySelectorAll('input')).toHaveLength(1);
      expect(input.classList).toContain('projected-input');
      expect(input.classList).toContain('form-control');
      expect(input.placeholder).toBe('Search users');
      expect(input.maxLength).toBe(12);
      expect(input.value).toBe('Initial value');
    });

    it('should connect the projected input to the form control and clear button', async () => {
      const input = getInput(element);

      await userEvent.fill(input, 'New value');
      await fixture.whenStable();
      expect(testComponent.search.value).toBe('New value');

      element.querySelector<HTMLButtonElement>('button')!.click();
      await fixture.whenStable();
      expect(testComponent.search.value).toBe('');
      expect(input.value).toBe('');
    });

    it('should use the projected input state for the clear button', async () => {
      const input = getInput(element);

      testComponent.readonly.set(true);
      await fixture.whenStable();
      expect(input.readOnly).toBe(true);
      expect(element.querySelector('button')).toBeDisabled();

      testComponent.readonly.set(false);
      testComponent.disabled.set(true);
      await fixture.whenStable();
      expect(input).toBeDisabled();
      expect(input.readOnly).toBe(false);
      expect(element.querySelector('button')).toBeDisabled();

      testComponent.disabled.set(false);
      await fixture.whenStable();
      expect(input).toBeEnabled();
      expect(element.querySelector('button')).toBeEnabled();
    });
  });
});
