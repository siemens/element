/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiDatepickerModule } from '../si-datepicker.module';
import { SiYearSelectionComponent as TestComponent } from './si-year-selection.component';
import { CalenderTestHelper, generateKeyEvent } from './test-helper.spec';

@Component({
  template: `<si-year-selection
    previousLabel="Previous Year Range"
    nextLabel="Next Year Range"
    [focusedDate]="focusedDate()"
    [startDate]="selectedDate()"
    [minDate]="minDate()"
    [maxDate]="maxDate()"
    (selectedValueChange)="selectionChange($event)"
    (yearRangeChange)="yearRangeChange($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiDatepickerModule, A11yModule, TestComponent]
})
class WrapperComponent {
  readonly focusedDate = signal(new Date(2022, 2, 26));
  readonly selectedDate = signal(new Date(2022, 2, 25));
  readonly minDate = signal<Date | undefined>(undefined);
  readonly maxDate = signal<Date | undefined>(undefined);
  cancelled = false;
  selectionChange(selection: Date | null): void {
    if (selection) {
      this.focusedDate.set(selection);
      this.selectedDate.set(selection);
    } else {
      this.cancelled = true;
    }
  }
  yearRangeChange(current: Date[]): void {}
}

describe('SiYearSelectionComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let helper: CalenderTestHelper;

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    helper = new CalenderTestHelper(element);
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(element).toBeDefined();
  });

  it('should contain 18 years', () => {
    const yearCells = helper.getEnabledCells();

    expect(yearCells.length).toBe(18);
  });

  it('shows selected year', () => {
    const selectedElement = element.querySelector('.selected')!;
    expect(selectedElement.innerHTML.trim()).toBe('2022');
  });

  it('should mark active date', () => {
    const activeCell = helper.getEnabledCellWithText('2022');
    expect(activeCell?.hasAttribute('cdkfocusinitial')).toBeTrue();
  });

  describe('with previous button', () => {
    const getButton = (): HTMLElement => helper.getPreviousButton();

    it('click should change to previous year range', () => {
      getButton().click();
      fixture.detectChanges();

      expect(element.querySelector('.year-range-label')?.innerHTML.trim()).toBe('1995 - 2012');
    });

    it('should be disabled when minDate same year', () => {
      wrapperComponent.minDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when minDate after focusedDate', () => {
      wrapperComponent.minDate.set(new Date(2013, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn?.getAttribute('aria-label')).toBe('Previous Year Range');
    });
  });

  describe('with next button', () => {
    const getButton = (): HTMLElement => helper.getNextButton();

    it('click should change to next year range', () => {
      getButton().click();
      fixture.detectChanges();

      expect(element.querySelector('.year-range-label')?.innerHTML.trim()).toBe('2031 - 2048');
    });

    it('should be disabled when maxDate same year', () => {
      wrapperComponent.maxDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when maxDate before focusedDate', () => {
      wrapperComponent.maxDate.set(new Date(2030, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be enabled when the user navigate to the previous page', () => {
      // When the maxDate is inside the current year range the next button should be disabled.
      // When the user navigate to the previous page the next button should be enabled.
      wrapperComponent.maxDate.set(new Date(2024, 0, 1));
      fixture.detectChanges();
      expect(getButton().getAttributeNames()).toContain('disabled');

      helper.getPreviousButton().click();
      fixture.detectChanges();
      expect(getButton().getAttributeNames()).not.toContain('disabled');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn?.getAttribute('aria-label')).toBe('Next Year Range');
    });
  });

  describe('calendar body navigation', () => {
    let calendarBodyElement: HTMLElement;
    beforeEach(() => {
      calendarBodyElement = helper.getCalendarBody();
      expect(calendarBodyElement).not.toBeNull();
      fixture.detectChanges();
    });

    it('should emit selectionChange with null on Escape press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('Escape'));
      fixture.detectChanges();

      expect(wrapperComponent.cancelled).toBeTrue();
    });

    it('should decrement year on left arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe('2021');
    });

    it('should increment year on right arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe('2023');
    });

    it('should go up a row on up arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe('2019');
    });

    it('should go down a row on down arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe('2025');
    });

    it('should go to first year in range on page up press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('PageUp'));
      fixture.detectChanges();

      const first = helper.getEnabledCells().at(0);
      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe(first!.innerHTML.trim());
    });

    it('should go to last year in range on page down press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('PageDown'));
      fixture.detectChanges();

      const last = helper.getEnabledCells().at(-1);
      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe(last!.innerHTML.trim());
    });

    it('should select focused date on click', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell?.innerHTML.trim()).toBe('2019');

      activeCell!.click();
      expect(wrapperComponent.selectedDate()).toEqual(new Date(2019, 0, 1));

      fixture.detectChanges();
      const selectedCell = element.querySelector('.selected');
      expect(selectedCell).toBeTruthy();
      expect(selectedCell?.innerHTML.trim()).toBe('2019');
    });
  });

  describe('focusedDate lower minDate', () => {
    let calendarBodyElement: HTMLElement;

    beforeEach(async () => {
      wrapperComponent.minDate.set(new Date(2022, 11, 1));
      wrapperComponent.focusedDate.set(new Date(1810, 1, 1));
      fixture.detectChanges();
      await fixture.whenStable();
      calendarBodyElement = helper.getCalendarBody();
    });

    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].forEach(key => {
      it(`should focus minDate on ${key} press`, () => {
        // By using the input field it is possible to configure a outside the allowed min/maxDate
        // While one of the allowed navigation keys the year selection shall automatically move and
        // focus the next allowed year.
        calendarBodyElement.dispatchEvent(generateKeyEvent(key));
        fixture.detectChanges();

        const activeCell = helper.getEnabledCellWithText('2022');
        expect(activeCell?.hasAttribute('cdkfocusinitial')).toBeTrue();
      });
    });
  });

  describe('focusedDate higher maxDate', () => {
    let calendarBodyElement: HTMLElement;

    beforeEach(async () => {
      wrapperComponent.maxDate.set(new Date(2022, 11, 1));
      wrapperComponent.focusedDate.set(new Date(2051, 1, 1));
      fixture.detectChanges();
      await fixture.whenStable();
      calendarBodyElement = helper.getCalendarBody();
    });

    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].forEach(key => {
      it(`should focus maxDate on ${key} press`, () => {
        // By using the input field it is possible to configure a outside the allowed min/maxDate
        // While one of the allowed navigation keys the year selection shall automatically move and
        // focus the next allowed year.
        calendarBodyElement.dispatchEvent(generateKeyEvent(key));
        fixture.detectChanges();

        const activeCell = helper.getEnabledCellWithText('2022');
        expect(activeCell?.hasAttribute('cdkfocusinitial')).toBeTrue();
      });
    });
  });
});
