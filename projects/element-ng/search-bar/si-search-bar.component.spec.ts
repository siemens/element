/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SiSearchBarComponent } from './index';

describe('SiSearchBarComponent', () => {
  const fakeInput = (text: string, element: HTMLElement): void => {
    const input = element.querySelector('input');
    input!.value = text;
    input!.dispatchEvent(new Event('input'));
  };

  const getParameterFromSpy = (spy: any): string => (spy as jasmine.Spy).calls.mostRecent().args[0];

  describe('as form control', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SiSearchBarComponent;
    let testComponent: TestComponent;
    let element: HTMLElement;

    @Component({
      imports: [CommonModule, ReactiveFormsModule, SiSearchBarComponent],
      template: `<si-search-bar
        [placeholder]="placeholder"
        [showIcon]="true"
        [formControl]="search"
        [prohibitedCharacters]="prohibitedCharacters"
      />`
    })
    class TestComponent {
      placeholder = 'Placeholder';
      search = new FormControl('');
      prohibitedCharacters?: string;
      readonly searchBar = viewChild.required(SiSearchBarComponent);
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      testComponent = fixture.componentInstance;
      component = fixture.componentInstance.searchBar();
      element = fixture.nativeElement;
    });

    it('should support custom placeholder', () => {
      testComponent.placeholder = 'Users';
      fixture.detectChanges();
      expect(element.querySelector('input')!.placeholder).toBe('Users');
    });

    it('should reset search when clicking cancel button', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      testComponent.search.setValue('Test1234$');
      fixture.detectChanges();
      element.querySelector<HTMLElement>('button')!.click();
      tick(1000);
      expect(getParameterFromSpy(component.searchChange.emit)).toBe('');
    }));

    it('should trigger the change event on input', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      fixture.detectChanges();
      fakeInput('Test1234$', element);
      tick(1000);
      expect(getParameterFromSpy(component.searchChange.emit)).toEqual('Test1234$');
    }));

    it('should trigger the initial change event just once per value', fakeAsync(() => {
      fixture.detectChanges();
      spyOn(component.searchChange, 'emit');
      fakeInput('CodeTest1234$', element);
      fixture.detectChanges();
      tick(400);
      expect(component.searchChange.emit).toHaveBeenCalledTimes(1);
    }));

    it('should not prohibit characters by default', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      fixture.detectChanges();
      fakeInput('Test1234$', element);
      tick(1000);
      expect(getParameterFromSpy(component.searchChange.emit)).toEqual('Test1234$');
    }));

    it('should not prohibit characters if string is empty', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters = '1234$';
      fixture.detectChanges();
      fakeInput('', element);
      tick(1000);
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    }));

    it('should not prohibit characters if string is valid', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters = '1234$';
      fixture.detectChanges();
      fakeInput('Test', element);
      tick(1000);
      expect(getParameterFromSpy(component.searchChange.emit)).toEqual('Test');
    }));

    it('should prohibit characters if string is not valid', fakeAsync(() => {
      spyOn(component.searchChange, 'emit');
      testComponent.prohibitedCharacters = '1234$';
      fixture.detectChanges();
      fakeInput('Test1234$', element);
      tick(1000);
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    }));

    it('should support disable state', () => {
      testComponent.search.disable();
      fixture.detectChanges();
      expect(element.querySelector('input')!.disabled).toBe(true);
      fixture.componentInstance.search.enable();
      fixture.detectChanges();
      expect(element.querySelector('input')!.disabled).toBe(false);
    });

    it('should not emit values when changed via form control', () => {
      spyOn(component.searchChange, 'emit');
      fixture.componentInstance.search = new FormControl('Initial Value');
      fixture.detectChanges();
      expect(element.querySelector('input')!.value).toBe('Initial Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();

      fixture.componentInstance.search.setValue('Updated Value');
      expect(element.querySelector('input')!.value).toBe('Updated Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('as value input', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SiSearchBarComponent;
    let testComponent: TestComponent;
    let element: HTMLElement;

    @Component({
      imports: [CommonModule, SiSearchBarComponent],
      template: `<si-search-bar [value]="value" [disabled]="disabled" />`
    })
    class TestComponent {
      value = 'Initial Value';
      disabled = false;
      readonly searchBar = viewChild.required(SiSearchBarComponent);
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      testComponent = fixture.componentInstance;
      component = fixture.componentInstance.searchBar();
      element = fixture.nativeElement;
    });

    it('should not emit values when changed via value input', () => {
      spyOn(component.searchChange, 'emit');
      testComponent.value = 'Initial Value';
      fixture.detectChanges();
      expect(element.querySelector('input')!.value).toBe('Initial Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();

      testComponent.value = 'Updated Value';
      fixture.detectChanges();
      expect(element.querySelector('input')!.value).toBe('Updated Value');
      expect(component.searchChange.emit).not.toHaveBeenCalled();
    });

    it('should support disabled input', () => {
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(element.querySelector('input')!.disabled).toBe(true);
      testComponent.disabled = false;
      fixture.detectChanges();
      expect(element.querySelector('input')!.disabled).toBe(false);
    });
  });
});
