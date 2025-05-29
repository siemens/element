/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { Component, ErrorHandler } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';
import { SiAutocompleteDirective } from './si-autocomplete.directive';

@Component({
  template: `
    <input #autocomplete="siAutocomplete" siAutocomplete />
    @if (showList) {
      <div
        [siAutocompleteListboxFor]="autocomplete"
        [siAutocompleteDefaultIndex]="defaultIndex"
        (siAutocompleteOptionSubmitted)="submitted($event)"
      >
        @if (hasValues) {
          <div siAutocompleteOption="a" id="option-a"></div>
          <div siAutocompleteOption="b" id="option-b"></div>
          <div siAutocompleteOption="c"></div>
          <div siAutocompleteOption="d"></div>
        }
      </div>
    }
  `,
  imports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective]
})
class TestHostComponent {
  showList = false;
  hasValues = true;
  value?: string;
  defaultIndex = 0;
  submitted(event: string): void {
    this.value = event;
  }
}

describe('SiAutocompleteDirective', () => {
  let testComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testComponent = fixture.componentInstance;
  });

  it('should be navigable', async () => {
    const input = fixture.debugElement.query(By.css('input'));
    expect(Object.keys(input.attributes)).not.toContain('ariaActiveDescendant');
    testComponent.showList = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(Object.keys(input.attributes)).toContain('aria-activedescendant');
    expect(input.attributes['aria-activedescendant']).toBe('option-a');
    input.triggerEventHandler('keydown', {
      key: 'ArrowDown',
      keyCode: DOWN_ARROW,
      preventDefault: () => {}
    });
    input.triggerEventHandler('keydown', {
      key: 'ArrowDown',
      keyCode: DOWN_ARROW,
      preventDefault: () => {}
    });
    input.triggerEventHandler('keydown', {
      key: 'ArrowUp',
      keyCode: UP_ARROW,
      preventDefault: () => {}
    });
    input.triggerEventHandler('keydown', {
      key: 'Enter',
      keyCode: ENTER,
      preventDefault: () => {},
      stopImmediatePropagation: () => {}
    });
    fixture.detectChanges();
    expect(input.attributes['aria-activedescendant']).toBe('option-b');
  });

  it('should detect click', async () => {
    testComponent.showList = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.debugElement
      .queryAll(By.directive(SiAutocompleteOptionDirective))
      .at(3)!
      .triggerEventHandler('click');
    expect(testComponent.value).toBe('d');
  });

  it('should not throw an error when the user presses enter on empty suggestion list', async () => {
    testComponent.showList = true;
    testComponent.hasValues = false;
    fixture.detectChanges();
    const spy = spyOn(testComponent, 'submitted');
    const spyError = spyOn(ErrorHandler.prototype, 'handleError').and.callThrough();

    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'Enter',
      keyCode: ENTER,
      preventDefault: () => {}
    });

    expect(spyError).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should select an element if default index was changed and none was selected', async () => {
    testComponent.defaultIndex = -1;
    testComponent.showList = true;
    // needed to detect changes triggered by queueMicrotask
    fixture.autoDetectChanges(true);
    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .filter(option => option.classes.active)
    ).toHaveSize(0);
    testComponent.defaultIndex = 0;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .filter(option => option.classes.active)
    ).toHaveSize(1);
    testComponent.defaultIndex = 1;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .map(option => !!option.classes.active)
    ).toEqual([true, false, false, false]);
  });
});
