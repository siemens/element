/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getLocaleMonthNames } from '../date-time-helper';
import { CalendarTestHelper, generateKeyEvent } from '../testing/test-helper';
import { SiMonthSelectionComponent as TestComponent } from './si-month-selection.component';

describe('SiMonthSelectionComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<TestComponent>;
  let helper: CalendarTestHelper;

  let focusedDate: WritableSignal<Date>;
  let startDate: WritableSignal<Date>;
  let months: WritableSignal<string[]>;
  let minDate: WritableSignal<Date | undefined>;
  let maxDate: WritableSignal<Date | undefined>;
  let selectionChangeSpy = vi.fn();
  let viewChangeSpy = vi.fn();
  let cancelled: boolean;

  beforeEach(() => {
    focusedDate = signal(new Date(2022, 2, 26));
    startDate = signal(new Date(2022, 2, 25));
    months = signal(getLocaleMonthNames('en'));
    minDate = signal<Date | undefined>(undefined);
    maxDate = signal<Date | undefined>(undefined);
    cancelled = false;
    selectionChangeSpy = vi.fn((selection?: Date | null) => {
      if (selection) {
        startDate.set(selection);
        focusedDate.set(selection);
      } else {
        cancelled = true;
      }
    });
    viewChangeSpy = vi.fn();

    const previousLabel = signal('Previous Year');
    const nextLabel = signal('Next Year');

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('previousLabel', previousLabel),
        inputBinding('nextLabel', nextLabel),
        inputBinding('startDate', startDate),
        inputBinding('months', months),
        inputBinding('minDate', minDate),
        inputBinding('maxDate', maxDate),
        inputBinding('focusedDate', focusedDate),
        outputBinding<Date>('focusedDateChange', (date: Date) => focusedDate.set(date)),
        outputBinding<Date | null>('selectedValueChange', selectionChangeSpy),
        outputBinding<'year'>('viewChange', viewChangeSpy)
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

  it('should contain all months', () => {
    const monthCells = helper.getEnabledCells();

    expect(monthCells.length).toBe(12);
  });

  it('shows selected month', () => {
    const expected = months().at(focusedDate().getMonth());
    const selectedElement = element.querySelector('.selected')!;
    expect(selectedElement).toHaveTextContent(expected!);
  });

  it('should mark active date', () => {
    const expected = months().at(focusedDate().getMonth());
    const activeCell = helper.getEnabledCellWithText(expected!);
    expect(activeCell?.hasAttribute('cdkfocusinitial')).toBe(true);
  });

  it('should focus active date', () => {
    const expected = months().at(focusedDate().getMonth());
    const activeCell = helper.getEnabledCellWithText(expected!);
    expect(activeCell?.hasAttribute('cdkFocusInitial')).toBeTruthy();
    expect(activeCell).toHaveAttribute('tabindex', expect.stringContaining('0'));
  });

  it('should update focusedDate and takeover date on focus', () => {
    helper.getEnabledCells().at(0)?.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(focusedDate()).toEqual(new Date(2022, 0, 26));
  });

  it('should emit viewChange', () => {
    helper.getOpenYearViewLink().click();

    expect(viewChangeSpy).toHaveBeenCalledWith('year');
  });

  describe('with previous button', () => {
    const getButton = (): HTMLElement => helper.getPreviousButton();

    it('click should change focusedDate to previous year', () => {
      getButton().click();
      fixture.detectChanges();

      expect(helper.getOpenYearViewLink()).toHaveTextContent('2021');
    });

    it('should be disabled when minDate same year', () => {
      minDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when minDate after focusedDate', () => {
      minDate.set(new Date(2023, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn).toHaveAttribute('aria-label', 'Previous Year');
    });
  });

  describe('with next button', () => {
    const getButton = (): HTMLElement => helper.getNextButton();

    it('click should change focusedDate to next year', () => {
      getButton().click();
      fixture.detectChanges();

      expect(helper.getOpenYearViewLink()).toHaveTextContent('2023');
    });

    it('should be disabled when maxDate same year', () => {
      maxDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when maxDate before focusedDate', () => {
      maxDate.set(new Date(2021, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn).toHaveAttribute('aria-label', 'Next Year');
    });
  });

  describe('a11y', () => {
    it('should have month and year as aria-label', () => {
      const monthCells = helper.getEnabledCells();
      let index = 0;
      monthCells.forEach(cell => {
        const label = cell.getAttribute('aria-label');
        const expected = `${months()[index]} ${focusedDate().getFullYear()}`;

        expect(label).toBe(expected);
        index++;
      });
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

    it('should decrement month on left arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2022, 1, 26));
    });

    it('should increment month on right arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2022, 3, 26));
    });

    it('should decrement year and move to december on left arrow press', () => {
      focusedDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2021, 11, 1));
    });

    it('should increment year and move to january on right arrow press', () => {
      focusedDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2023, 0, 1));
    });

    it('should go up a row on up arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2022, 0, 26));
    });

    it('should go down a row on down arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2022, 4, 26));
    });

    it('should select focused date on click', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      expect(focusedDate()).toEqual(new Date(2022, 0, 26));

      const activeCell = calendarBodyElement.querySelector('[cdkfocusinitial]') as HTMLElement;
      activeCell.click();
      expect(startDate()).toEqual(new Date(2022, 0, 1));
    });
  });

  describe('range test', () => {
    beforeEach(() => {
      minDate.set(new Date(2022, 1, 25));
      maxDate.set(new Date(2022, 10, 25));
      fixture.detectChanges();
    });

    it('should disable months which are out of range', () => {
      expect(helper.getEnabledCells().length).toBe(10);
      expect(helper.getDisabledCells().length).toBe(2);
    });

    it('should not select when month out of range', () => {
      const disabledCells = helper.getDisabledCells();
      disabledCells.forEach(c => {
        c.click();
        expect(startDate()).toEqual(new Date(2022, 2, 25));
        expect(focusedDate()).toEqual(new Date(2022, 2, 26));
      });
    });
  });
});
