/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ErrorHandler, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';
import { SiAutocompleteDirective } from './si-autocomplete.directive';

@Component({
  imports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective],
  template: `
    <input #autocomplete="siAutocomplete" siAutocomplete />
    @if (showList()) {
      <div
        [siAutocompleteListboxFor]="autocomplete"
        [siAutocompleteDefaultIndex]="defaultIndex()"
        (siAutocompleteOptionSubmitted)="submitted($event)"
      >
        @if (hasValues()) {
          <div siAutocompleteOption="a" id="option-a"></div>
          <div siAutocompleteOption="b" id="option-b"></div>
          <div siAutocompleteOption="c"></div>
          <div siAutocompleteOption="d"></div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly showList = signal(false);
  readonly hasValues = signal(true);
  readonly value = signal<string | undefined>(undefined);
  readonly defaultIndex = signal(0);
  submitted(event: string): void {
    this.value.set(event);
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
    testComponent.showList.set(true);
    await fixture.whenStable();
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
    await fixture.whenStable();
    expect(input.attributes['aria-activedescendant']).toBe('option-b');
  });

  it('should detect click', async () => {
    testComponent.showList.set(true);
    await fixture.whenStable();
    fixture.debugElement
      .queryAll(By.directive(SiAutocompleteOptionDirective))
      .at(3)!
      .triggerEventHandler('click');
    expect(testComponent.value()).toBe('d');
  });

  it('should not throw an error when the user presses enter on empty suggestion list', async () => {
    testComponent.showList.set(true);
    testComponent.hasValues.set(false);
    await fixture.whenStable();
    const spy = vi.spyOn(testComponent, 'submitted');
    const spyError = vi.spyOn(ErrorHandler.prototype, 'handleError');

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
    testComponent.defaultIndex.set(-1);
    testComponent.showList.set(true);
    await fixture.whenStable();

    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .filter(option => option.classes.active)
    ).toHaveLength(0);
    testComponent.defaultIndex.set(0);
    await fixture.whenStable();
    //await fixture.whenStable();
    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .filter(option => option.classes.active)
    ).toHaveLength(1);
    testComponent.defaultIndex.set(1);
    await fixture.whenStable();
    expect(
      fixture.debugElement
        .queryAll(By.directive(SiAutocompleteOptionDirective))
        .map(option => !!option.classes.active)
    ).toEqual([true, false, false, false]);
  });
});
