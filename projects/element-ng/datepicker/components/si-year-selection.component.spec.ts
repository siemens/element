/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTestHelper, generateKeyEvent } from '../testing/test-helper';
import { SiYearSelectionComponent as TestComponent } from './si-year-selection.component';

describe('SiYearSelectionComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<TestComponent>;
  let helper: CalendarTestHelper;

  let focusedDate: WritableSignal<Date>;
  let selectedDate: WritableSignal<Date>;
  let minDate: WritableSignal<Date | undefined>;
  let maxDate: WritableSignal<Date | undefined>;
  let selectionChangeSpy = vi.fn();
  let yearRangeChangeSpy = vi.fn();
  let cancelled: boolean;

  beforeEach(() => {
    focusedDate = signal(new Date(2022, 2, 26));
    selectedDate = signal(new Date(2022, 2, 25));
    minDate = signal<Date | undefined>(undefined);
    maxDate = signal<Date | undefined>(undefined);
    cancelled = false;
    selectionChangeSpy = vi.fn((selection: Date | null) => {
      if (selection) {
        focusedDate.set(selection);
        selectedDate.set(selection);
      } else {
        cancelled = true;
      }
    });
    yearRangeChangeSpy = vi.fn();

    const previousLabel = signal('Previous Year Range');
    const nextLabel = signal('Next Year Range');

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('previousLabel', previousLabel),
        inputBinding('nextLabel', nextLabel),
        inputBinding('focusedDate', focusedDate),
        inputBinding('startDate', selectedDate),
        inputBinding('minDate', minDate),
        inputBinding('maxDate', maxDate),
        outputBinding<Date>('focusedDateChange', (date: Date) => focusedDate.set(date)),
        outputBinding<Date | null>('selectedValueChange', selectionChangeSpy),
        outputBinding<Date[]>('yearRangeChange', yearRangeChangeSpy)
      ]
    });
    element = fixture.nativeElement;
    helper = new CalendarTestHelper(element);
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
    expect(selectedElement).toHaveTextContent('2022');
  });

  it('should mark active date', () => {
    const activeCell = helper.getEnabledCellWithText('2022');
    expect(activeCell?.hasAttribute('cdkfocusinitial')).toBe(true);
  });

  describe('with previous button', () => {
    const getButton = (): HTMLElement => helper.getPreviousButton();

    it('click should change to previous year range', () => {
      getButton().click();
      fixture.detectChanges();

      expect(element.querySelector('.year-range-label')).toHaveTextContent('1995 - 2012');
    });

    it('should be disabled when minDate same year', () => {
      minDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when minDate after focusedDate', () => {
      minDate.set(new Date(2013, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn).toHaveAttribute('aria-label', 'Previous Year Range');
    });
  });

  describe('with next button', () => {
    const getButton = (): HTMLElement => helper.getNextButton();

    it('click should change to next year range', () => {
      getButton().click();
      fixture.detectChanges();

      expect(element.querySelector('.year-range-label')).toHaveTextContent('2031 - 2048');
    });

    it('should be disabled when maxDate same year', () => {
      maxDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when maxDate before focusedDate', () => {
      maxDate.set(new Date(2030, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be enabled when the user navigate to the previous page', () => {
      // When the maxDate is inside the current year range the next button should be disabled.
      // When the user navigate to the previous page the next button should be enabled.
      maxDate.set(new Date(2024, 0, 1));
      fixture.detectChanges();
      expect(getButton().getAttributeNames()).toContain('disabled');

      helper.getPreviousButton().click();
      fixture.detectChanges();
      expect(getButton().getAttributeNames()).not.toContain('disabled');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn).toHaveAttribute('aria-label', 'Next Year Range');
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

      expect(cancelled).toBe(true);
    });

    it('should decrement year on left arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell).toHaveTextContent('2021');
    });

    it('should increment year on right arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell).toHaveTextContent('2023');
    });

    it('should go up a row on up arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell).toHaveTextContent('2019');
    });

    it('should go down a row on down arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();

      const activeCell = helper.getActiveCell();
      expect(activeCell).toHaveTextContent('2025');
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
      expect(activeCell).toHaveTextContent('2019');

      activeCell!.click();
      expect(selectedDate()).toEqual(new Date(2019, 0, 1));

      fixture.detectChanges();
      const selectedCell = element.querySelector('.selected');
      expect(selectedCell).toBeInTheDocument();
      expect(selectedCell).toHaveTextContent('2019');
    });
  });

  describe('focusedDate lower minDate', () => {
    let calendarBodyElement: HTMLElement;

    beforeEach(async () => {
      minDate.set(new Date(2022, 11, 1));
      focusedDate.set(new Date(1810, 1, 1));
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
        expect(activeCell?.hasAttribute('cdkfocusinitial')).toBe(true);
      });
    });
  });

  describe('focusedDate higher maxDate', () => {
    let calendarBodyElement: HTMLElement;

    beforeEach(async () => {
      maxDate.set(new Date(2022, 11, 1));
      focusedDate.set(new Date(2051, 1, 1));
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
        expect(activeCell?.hasAttribute('cdkfocusinitial')).toBe(true);
      });
    });
  });
});
