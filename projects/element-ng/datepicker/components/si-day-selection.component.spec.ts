/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  addDays,
  getFirstDateInMonth,
  getWeekOfYear,
  isSameDate,
  today as getToday,
  isSameMonth,
  isSameYear,
  daysInMonth
} from '../date-time-helper';
import { WeekStart } from '../si-datepicker.model';
import { CalendarTestHelper, generateKeyEvent } from '../testing/test-helper';
import { SiDaySelectionComponent as TestComponent } from './si-day-selection.component';

describe('SiDaySelectionComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<TestComponent>;
  let helper: CalendarTestHelper;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const selectDate = (date: number): void => {
    helper.clickEnabledCell(date.toString());
    fixture.detectChanges();
  };

  const mouseOverDate = (date: number): void => {
    helper
      .getEnabledCellWithText(date.toString())
      ?.dispatchEvent(new Event('mouseover', { bubbles: true }));
    fixture.detectChanges();
  };

  describe('When Single Select View', () => {
    let focusedDate: WritableSignal<Date>;
    let startDate: WritableSignal<Date>;
    let endDate: WritableSignal<Date | undefined>;
    let minDate: WritableSignal<Date>;
    let maxDate: WritableSignal<Date | undefined>;
    let enableDateRange: WritableSignal<boolean>;
    let hideWeekNumbers: WritableSignal<boolean>;
    let weekStartDay: WritableSignal<WeekStart>;
    let selectionChangeSpy = vi.fn();
    let activeMonthChangeSpy = vi.fn();
    let viewChangeSpy = vi.fn();

    const getFirstDayInMonth = (): Date => getFirstDateInMonth(focusedDate());

    beforeEach(() => {
      focusedDate = signal(new Date('2022-03-26'));
      startDate = signal(new Date('2022-03-25'));
      endDate = signal<Date | undefined>(undefined);
      minDate = signal(new Date('2021-03-01'));
      maxDate = signal<Date | undefined>(new Date('2023-03-31'));
      enableDateRange = signal(false);
      hideWeekNumbers = signal(false);
      weekStartDay = signal<WeekStart>('monday');
      selectionChangeSpy = vi.fn((selection: Date | null) => {
        if (selection) {
          focusedDate.set(selection);
          startDate.set(selection);
        }
      });
      activeMonthChangeSpy = vi.fn();
      viewChangeSpy = vi.fn();

      const previousLabel = signal('Previous Month');
      const nextLabel = signal('Next Month');

      fixture = TestBed.createComponent(TestComponent, {
        bindings: [
          inputBinding('previousLabel', previousLabel),
          inputBinding('nextLabel', nextLabel),
          inputBinding('startDate', startDate),
          inputBinding('endDate', endDate),
          inputBinding('isRangeSelection', enableDateRange),
          inputBinding('hideWeekNumbers', hideWeekNumbers),
          inputBinding('minDate', minDate),
          inputBinding('maxDate', maxDate),
          inputBinding('weekStartDay', weekStartDay),
          inputBinding('focusedDate', focusedDate),
          outputBinding<Date>('focusedDateChange', (date: Date) => focusedDate.set(date)),
          outputBinding<Date | null>('selectedValueChange', selectionChangeSpy),
          outputBinding<Date>('activeMonthChange', activeMonthChangeSpy),
          outputBinding<'month' | 'year'>('viewChange', viewChangeSpy)
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

    it('shows selected date if in same month', () => {
      const selectedElement = element.querySelector('.selected')!;
      expect(selectedElement).toHaveTextContent('25');
    });

    it('does not show selected date if in different month', async () => {
      startDate.set(new Date('2022-05-15'));
      await fixture.whenStable();

      const selectedElement = element.querySelector('.selected');
      expect(selectedElement).not.toBeInTheDocument();
    });

    it('select cell on cell clicked', () => {
      selectDate(31);

      const selectedElement = element.querySelector('.selected')!;
      expect(selectedElement).toHaveTextContent('31');
      expect(isSameDate(focusedDate(), new Date('2022-03-31'))).toBe(true);
    });

    it('should focus active date', () => {
      const activeCell = helper.getEnabledCellWithText('26');
      expect(activeCell?.hasAttribute('cdkFocusInitial')).toBeTruthy();
      expect(activeCell).toHaveAttribute('tabindex', expect.stringContaining('0'));
    });

    it('should show week numbers', () => {
      let expected = getWeekOfYear(getFirstDayInMonth(), 'monday');
      const actualWeekNumbers = helper.getRowLabels();
      actualWeekNumbers.forEach(weekElement => {
        expect(weekElement).toHaveTextContent(expected.toString());
        expected++;
      });
    });

    it('should not show week numbers', () => {
      hideWeekNumbers.set(true);
      fixture.detectChanges();

      const actual = helper.getRowLabels();
      expect(actual.length).toBe(0);
      expect(element.querySelector('.week-num')).not.toBeInTheDocument();
    });

    ['PageUp', 'PageDown'].forEach(key => {
      it(`should emit activeMonthChange on ${key} press`, async () => {
        helper.getCalendarBody().dispatchEvent(generateKeyEvent('PageDown'));
        await fixture.whenStable();
        expect(activeMonthChangeSpy).toHaveBeenCalled();
      });
    });

    ['Previous Month', 'Next Month'].forEach(label => {
      it(`should emit activeMonthChange on button '${label}' click`, async () => {
        element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
        await fixture.whenStable();
        expect(activeMonthChangeSpy).toHaveBeenCalled();
      });
    });

    it('should emit viewChange when clicking on month', () => {
      helper.getOpenMonthViewLink().click();

      expect(viewChangeSpy).toHaveBeenCalledWith('month');
    });

    it('should emit viewChange when clicking on year', () => {
      helper.getOpenYearViewLink().click();

      expect(viewChangeSpy).toHaveBeenCalledWith('year');
    });

    it('should always show 6 weeks', () => {
      const cellsCount = 6 * 7;
      for (let month = 0; month < 12; month++) {
        focusedDate.set(new Date(2022, month, 1));
        fixture.detectChanges();

        expect(helper.getCells()).toHaveLength(cellsCount);
      }
    });

    describe('with previous button', () => {
      const getButton = (): HTMLElement => helper.getPreviousButton();

      it('click should change focusedDate to previous month', () => {
        getButton().click();
        fixture.detectChanges();

        expect(helper.getOpenMonthViewLink()).toHaveTextContent('February');
      });

      it('should be disabled when minDate same month', () => {
        minDate.set(new Date(2022, 2, 22));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should be disabled when minDate after focusedDate', () => {
        minDate.set(new Date(2022, 3, 1));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should have aria-label', () => {
        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('aria-label');
        expect(btn).toHaveAttribute('aria-label', 'Previous Month');
      });
    });

    describe('with next button', () => {
      const getButton = (): HTMLElement => helper.getNextButton();

      it('click should change focusedDate to next month', () => {
        getButton().click();
        fixture.detectChanges();

        expect(helper.getOpenMonthViewLink()).toHaveTextContent('April');
      });

      it('should be disabled when maxDate same month', () => {
        maxDate.set(new Date(2022, 2, 27));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should be disabled when maxDate before focusedDate', () => {
        maxDate.set(new Date(2021, 2, 1));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should have aria-label', () => {
        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('aria-label');
        expect(btn).toHaveAttribute('aria-label', 'Next Month');
      });
    });

    describe('a11y', () => {
      it('should set the correct role on the internal table node', () => {
        const table = element.querySelector('table')!;
        expect(table).toHaveAttribute('role', 'grid');
      });

      it('should set the correct scope on the table headers', () => {
        const tableHeaders = helper.getCalendarHeaders();

        expect(tableHeaders.every(header => header.getAttribute('scope') === 'col')).toBe(true);
      });

      it('should have date-string as aria-label', () => {
        const cells = helper.getEnabledCells();
        let currentDate = getFirstDayInMonth();
        cells.forEach(cell => {
          const label = cell.getAttribute('aria-label');
          const dateString = currentDate.toDateString();
          expect(label).toBe(dateString);
          currentDate = addDays(currentDate, 1);
        });
      });

      it('should set aria-current to today', async () => {
        focusedDate.set(getToday());
        fixture.detectChanges();
        await fixture.whenStable();

        const actual = helper.queryAsArray('[aria-current]');
        expect(actual.length).toBe(1);
        expect(actual[0]).toHaveAttribute('aria-current', 'date');
      });
    });

    describe('calendar body navigation', () => {
      let calendarBodyElement: HTMLElement;

      beforeEach(() => {
        calendarBodyElement = helper.getCalendarBody();
        expect(calendarBodyElement).not.toBeNull();

        fixture.detectChanges();
      });

      it('should decrement date on left arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 25));
      });

      it('should increment date on right arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 27));
      });

      it('should decrement date to previous month on left arrow press', () => {
        focusedDate.set(new Date(2022, 2, 1));
        fixture.detectChanges();

        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 1, 28));
      });

      it('should increment date to next month on right arrow press', () => {
        focusedDate.set(new Date(2022, 2, 31));
        fixture.detectChanges();

        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 3, 1));
      });

      it('should go up a row on up arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 19));
      });

      it('should go down a row on down arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 3, 2));
      });

      it('should go to first col on home press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('Home'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 21));
      });

      it('should go to last col on end press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('End'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 27));
      });

      it('should go up a month on page up press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('PageUp'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 1, 26));
      });

      it('should go down a month on page down press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('PageDown'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 3, 26));
      });

      it('should select active date on click', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
        fixture.detectChanges();

        expect(focusedDate()).toEqual(new Date(2022, 2, 19));

        const activeCell = calendarBodyElement.querySelector('[cdkfocusinitial]') as HTMLElement;
        activeCell.click();
        expect(selectionChangeSpy).toHaveBeenCalledWith(new Date(2022, 2, 19));
      });
    });

    describe('with today button', () => {
      beforeEach(() => {
        maxDate.set(getToday());
        fixture.detectChanges();
      });

      it('should go to today', () => {
        const pipeSpy = vi.spyOn(DatePipe.prototype, 'transform');

        (element.querySelector('.today-button') as HTMLElement)!.click();
        fixture.detectChanges();

        const today = getToday();

        expect(pipeSpy).toHaveBeenCalledTimes(2);

        const month = vi.mocked(pipeSpy).mock.calls[0];
        expect(isSameMonth(month[0] as Date, today)).toBe(true);
        expect(month[1] as string).toBe('MMMM');

        const year = vi.mocked(pipeSpy).mock.calls[1];
        expect(isSameYear(year[0] as Date, today)).toBe(true);
        expect(year[1] as string).toBe('yyyy');

        const activeCell = helper
          .getCalendarBody()
          .querySelector('[cdkfocusinitial]') as HTMLElement;
        expect(activeCell).toBeInTheDocument();
        expect(activeCell).toHaveTextContent(today.getDate().toString());
        expect(isSameDate(focusedDate(), today)).toBe(true);
      });

      it('should disable today button after click', async () => {
        helper.getTodayButton().click();
        fixture.detectChanges();

        expect(helper.getTodayButton()?.getAttributeNames()).toContain('disabled');
      });

      it('should disable today button if the activeDate and today are in the same month', async () => {
        const date = getToday();
        // Choose either the first or the last in the month
        if (date.getDate() === 1) {
          date.setDate(daysInMonth(date.getMonth(), date.getFullYear()));
        } else {
          date.setDate(1);
        }
        focusedDate.set(date);
        fixture.detectChanges();

        expect(helper.getTodayButton()?.getAttributeNames()).toContain('disabled');
      });

      it('should go to today also when maxDate is before today', async () => {
        const maxDateValue = getToday();
        maxDateValue.setDate(-1);
        maxDate.set(maxDateValue);
        fixture.detectChanges();

        helper.getTodayButton().click();
        fixture.detectChanges();

        const today = getToday();

        const activeCell = helper
          .getCalendarBody()
          .querySelector('[cdkfocusinitial]') as HTMLElement;
        expect(activeCell).toBeInTheDocument();
        expect(activeCell).toHaveTextContent(today.getDate().toString());
        expect(isSameDate(focusedDate(), today)).toBe(true);
      });
    });

    describe('with weekStartDay', () => {
      beforeEach(() => {
        hideWeekNumbers.set(true);
        fixture.detectChanges();
      });

      it('weekStart should be monday', () => {
        weekStartDay.set('monday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)).toHaveTextContent('Mon');
        expect(helper.getCells().at(0)).toHaveTextContent('28');
        expect(helper.getCells().at(6)).toHaveTextContent('6');
      });

      it('weekStart should be sunday', () => {
        weekStartDay.set('sunday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)).toHaveTextContent('Sun');
        expect(helper.getCells().at(0)).toHaveTextContent('27');
        expect(helper.getCells().at(6)).toHaveTextContent('5');
      });

      it('weekStart should be saturday', () => {
        weekStartDay.set('saturday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)).toHaveTextContent('Sat');
        expect(helper.getCells().at(0)).toHaveTextContent('26');
        expect(helper.getCells().at(6)).toHaveTextContent('4');
      });
    });
  });

  describe('When Range Select View', () => {
    let focusedDate: WritableSignal<Date>;
    let startDate: WritableSignal<Date | undefined>;
    let endDate: WritableSignal<Date | undefined>;
    let minDate: WritableSignal<Date>;
    let maxDate: WritableSignal<Date | undefined>;
    let hideWeekNumbers: WritableSignal<boolean>;
    let weekStartDay: WritableSignal<WeekStart>;
    let selectionChangeSpy = vi.fn();
    let activeMonthChangeSpy = vi.fn();

    beforeEach(() => {
      focusedDate = signal(new Date('2022-03-26'));
      startDate = signal<Date | undefined>(undefined);
      endDate = signal<Date | undefined>(undefined);
      minDate = signal(new Date('2021-03-01'));
      maxDate = signal<Date | undefined>(new Date('2023-03-31'));
      hideWeekNumbers = signal(false);
      weekStartDay = signal<WeekStart>('monday');
      selectionChangeSpy = vi.fn((selection: Date | null) => {
        if (!selection) {
          return;
        }
        if (startDate() === undefined || (startDate() !== undefined && endDate() !== undefined)) {
          focusedDate.set(selection);
          startDate.set(selection);
          endDate.set(undefined);
        } else {
          focusedDate.set(selection);
          endDate.set(selection);
        }
      });
      activeMonthChangeSpy = vi.fn();

      const previousLabel = signal('Previous Month');
      const nextLabel = signal('Next Month');
      const isRangeSelection = signal(true);

      fixture = TestBed.createComponent(TestComponent, {
        bindings: [
          inputBinding('previousLabel', previousLabel),
          inputBinding('nextLabel', nextLabel),
          inputBinding('isRangeSelection', isRangeSelection),
          inputBinding('startDate', startDate),
          inputBinding('endDate', endDate),
          inputBinding('hideWeekNumbers', hideWeekNumbers),
          inputBinding('minDate', minDate),
          inputBinding('maxDate', maxDate),
          inputBinding('weekStartDay', weekStartDay),
          inputBinding('focusedDate', focusedDate),
          outputBinding<Date>('focusedDateChange', (date: Date) => focusedDate.set(date)),
          outputBinding<Date | null>('selectedValueChange', selectionChangeSpy),
          outputBinding<Date>('activeMonthChange', activeMonthChangeSpy)
        ]
      });
      element = fixture.nativeElement;
      helper = new CalendarTestHelper(element);
      fixture.detectChanges();
    });

    it('should select range when two cells were clicked', () => {
      selectDate(16);

      let selectedElements = helper.queryAsArray('.selected')!;
      expect(selectedElements.length).toBe(1);
      expect(selectedElements.at(-1)!).toHaveTextContent('16');
      expect(isSameDate(focusedDate(), new Date('2022-03-16'))).toBe(true);

      selectDate(31);

      selectedElements = helper.queryAsArray('.selected')!;
      expect(selectedElements.length).toBe(2);
      expect(selectedElements.at(-1)!).toHaveTextContent('31');
    });

    it('range start and end cell should have .range-start and .range-end class', () => {
      selectDate(16);
      selectDate(31);
      expect(helper.queryAsArray('.range-start').length).toBe(1);
      expect(helper.queryAsArray('.range-end').length).toBe(1);
    });

    it('range start and end cell should have range class', () => {
      selectDate(16);
      selectDate(31);
      expect(helper.queryAsArray('.range').length).toBe(14);
    });

    it('mouse before current selected date should preview range', () => {
      selectDate(16);
      mouseOverDate(18);

      expect(helper.queryAsArray('.range-hover').length).toBe(2);
    });

    it('mouse before current selected date should not preview range', () => {
      selectDate(16);
      mouseOverDate(14);

      expect(helper.queryAsArray('.range-hover').length).toBe(0);
    });
  });
});
