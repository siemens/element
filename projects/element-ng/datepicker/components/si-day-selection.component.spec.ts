/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

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
import { SiDaySelectionComponent as TestComponent } from './si-day-selection.component';
import { CalenderTestHelper, generateKeyEvent } from './test-helper.spec';

@Component({
  imports: [TestComponent],
  template: `<si-day-selection
    previousLabel="Previous Month"
    nextLabel="Next Month"
    [startDate]="startDate()"
    [endDate]="endDate()"
    [isRangeSelection]="enableDateRange()"
    [hideWeekNumbers]="hideWeekNumbers()"
    [minDate]="minDate()"
    [maxDate]="maxDate()"
    [weekStartDay]="weekStartDay()"
    [focusedDate]="focusedDate()"
    (focusedDateChange)="focusedDate.set($event)"
    (selectedValueChange)="selectionChange($event)"
    (activeMonthChange)="activeMonthChange($event)"
    (viewChange)="viewChange($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class SingleSelectComponent {
  readonly focusedDate = signal(new Date('2022-03-26'));
  readonly startDate = signal(new Date('2022-03-25'));
  readonly endDate = signal<Date | unknown>(null);
  readonly minDate = signal(new Date('2021-03-01'));
  readonly maxDate = signal<Date | unknown>(new Date('2023-03-31'));
  readonly enableDateRange = signal(false);
  readonly hideWeekNumbers = signal(false);
  readonly weekStartDay = signal('monday');

  activeMonth: Date | undefined;
  view?: 'month' | 'year';

  selectionChange(selection: Date): void {
    this.focusedDate.set(selection);
    this.startDate.set(selection);
  }

  activeMonthChange(current: Date): void {
    this.activeMonth = current;
  }

  viewChange(view: 'month' | 'year'): void {
    this.view = view;
  }
}

@Component({
  imports: [TestComponent],
  template: `<si-day-selection
    isRangeSelection="true"
    previousLabel="Previous Month"
    nextLabel="Next Month"
    [startDate]="startDate()"
    [endDate]="endDate()"
    [hideWeekNumbers]="hideWeekNumbers()"
    [minDate]="minDate()"
    [maxDate]="maxDate()"
    [weekStartDay]="weekStartDay()"
    [focusedDate]="focusedDate()"
    (focusedDateChange)="focusedDate.set($event)"
    (selectedValueChange)="selectionChange($event)"
    (activeMonthChange)="activeMonthChange($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class RangeSelectComponent {
  readonly focusedDate = signal(new Date('2022-03-26'));
  readonly startDate = signal<Date | unknown>(null);
  readonly endDate = signal<Date | unknown>(null);
  readonly minDate = signal(new Date('2021-03-01'));
  readonly maxDate = signal<Date | unknown>(new Date('2023-03-31'));
  readonly hideWeekNumbers = signal(false);
  readonly weekStartDay = signal('monday');
  activeMonth: Date | undefined;

  selectionChange(selection: Date): void {
    if (
      this.startDate() === undefined ||
      (this.startDate() !== undefined && this.endDate() !== undefined)
    ) {
      this.focusedDate.set(selection);
      this.startDate.set(selection);
      this.endDate.set(undefined);
    } else {
      this.focusedDate.set(selection);
      this.endDate.set(selection);
    }
  }

  activeMonthChange(current: Date): void {
    this.activeMonth = current;
  }
}

describe('SiDaySelectionComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<any>;
  let helper: CalenderTestHelper;

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
    let wrapperComponent: SingleSelectComponent;
    const getFirstDayInMonth = (): Date => getFirstDateInMonth(wrapperComponent.focusedDate());

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleSelectComponent);
      wrapperComponent = fixture.componentInstance;
      element = fixture.nativeElement;
      helper = new CalenderTestHelper(element);
      fixture.detectChanges();
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(element).toBeDefined();
    });

    it('shows selected date if in same month', () => {
      const selectedElement = element.querySelector('.selected')!;
      expect(selectedElement.innerHTML.trim()).toBe('25');
    });

    it('does not show selected date if in different month', fakeAsync(() => {
      wrapperComponent.startDate.set(new Date('2022-05-15'));
      fixture.detectChanges();

      const selectedElement = element.querySelector('.selected');
      expect(selectedElement).toBeNull();
    }));

    it('select cell on cell clicked', () => {
      selectDate(31);

      const selectedElement = element.querySelector('.selected')!;
      expect(selectedElement.innerHTML.trim()).toBe('31');
      expect(isSameDate(wrapperComponent.focusedDate(), new Date('2022-03-31'))).toBeTrue();
    });

    it('should focus active date', () => {
      const activeCell = helper.getEnabledCellWithText('26');
      expect(activeCell?.hasAttribute('cdkFocusInitial')).toBeTruthy();
      expect(activeCell?.getAttribute('tabindex')).toContain('0');
    });

    it('should show week numbers', () => {
      let expected = getWeekOfYear(getFirstDayInMonth(), 'monday');
      const actualWeekNumbers = helper.getRowLabels();
      actualWeekNumbers.forEach(weekElement => {
        expect(weekElement.innerHTML.trim()).toBe(expected.toString());
        expected++;
      });
    });

    it('should not show week numbers', () => {
      wrapperComponent.hideWeekNumbers.set(true);
      fixture.detectChanges();

      const actual = helper.getRowLabels();
      expect(actual.length).toBe(0);
      expect(element.querySelector('.week-num')).toBeFalsy();
    });

    ['PageUp', 'PageDown'].forEach(key => {
      it(`should emit activeMonthChange on ${key} press`, fakeAsync(() => {
        helper.getCalendarBody().dispatchEvent(generateKeyEvent('PageDown'));
        fixture.detectChanges();
        flush();
        expect(wrapperComponent.activeMonth).toBeTruthy();
      }));
    });

    ['Previous Month', 'Next Month'].forEach(label => {
      it(`should emit activeMonthChange on button '${label}' click`, fakeAsync(() => {
        element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
        fixture.detectChanges();
        flush();
        expect(wrapperComponent.activeMonth).toBeTruthy();
      }));
    });

    it('should emit viewChange when clicking on month', () => {
      helper.getOpenMonthViewLink().click();

      expect(wrapperComponent.view).toBe('month');
    });

    it('should emit viewChange when clicking on year', () => {
      helper.getOpenYearViewLink().click();

      expect(wrapperComponent.view).toBe('year');
    });

    it('should always show 6 weeks', () => {
      const cellsCount = 6 * 7;
      for (let month = 0; month < 12; month++) {
        wrapperComponent.focusedDate.set(new Date(2022, month, 1));
        fixture.detectChanges();

        expect(helper.getCells()).toHaveSize(cellsCount);
      }
    });

    describe('with previous button', () => {
      const getButton = (): HTMLElement => helper.getPreviousButton();

      it('click should change focusedDate to previous month', () => {
        getButton().click();
        fixture.detectChanges();

        expect(helper.getOpenMonthViewLink()?.innerHTML.trim()).toBe('February');
      });

      it('should be disabled when minDate same month', () => {
        wrapperComponent.minDate.set(new Date(2022, 2, 22));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should be disabled when minDate after focusedDate', () => {
        wrapperComponent.minDate.set(new Date(2022, 3, 1));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should have aria-label', () => {
        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('aria-label');
        expect(btn?.getAttribute('aria-label')).toBe('Previous Month');
      });
    });

    describe('with next button', () => {
      const getButton = (): HTMLElement => helper.getNextButton();

      it('click should change focusedDate to next month', () => {
        getButton().click();
        fixture.detectChanges();

        expect(helper.getOpenMonthViewLink()?.innerHTML.trim()).toBe('April');
      });

      it('should be disabled when maxDate same month', () => {
        wrapperComponent.maxDate.set(new Date(2022, 2, 27));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should be disabled when maxDate before focusedDate', () => {
        wrapperComponent.maxDate.set(new Date(2021, 2, 1));
        fixture.detectChanges();

        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('disabled');
        expect(btn?.getAttributeNames()).not.toContain('tabindex');
      });

      it('should have aria-label', () => {
        const btn = getButton();
        expect(btn?.getAttributeNames()).toContain('aria-label');
        expect(btn?.getAttribute('aria-label')).toBe('Next Month');
      });
    });

    describe('a11y', () => {
      it('should set the correct role on the internal table node', () => {
        const table = element.querySelector('table')!;
        expect(table.getAttribute('role')).toBe('grid');
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

      it('should set aria-current to today', fakeAsync(() => {
        wrapperComponent.focusedDate.set(getToday());
        fixture.detectChanges();

        const actual = helper.queryAsArray('[aria-current]');
        expect(actual.length).toBe(1);
        expect(actual[0].getAttribute('aria-current')).toBe('date');
      }));
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

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 25));
      });

      it('should increment date on right arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 27));
      });

      it('should decrement date to previous month on left arrow press', () => {
        wrapperComponent.focusedDate.set(new Date(2022, 2, 1));
        fixture.detectChanges();

        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 1, 28));
      });

      it('should increment date to next month on right arrow press', () => {
        wrapperComponent.focusedDate.set(new Date(2022, 2, 31));
        fixture.detectChanges();

        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 3, 1));
      });

      it('should go up a row on up arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 19));
      });

      it('should go down a row on down arrow press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 3, 2));
      });

      it('should go to first col on home press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('Home'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 21));
      });

      it('should go to last col on end press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('End'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 27));
      });

      it('should go up a month on page up press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('PageUp'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 1, 26));
      });

      it('should go down a month on page down press', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('PageDown'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 3, 26));
      });

      it('should select active date on click', () => {
        calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
        fixture.detectChanges();

        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 19));

        const activeCell = calendarBodyElement.querySelector('[cdkfocusinitial]') as HTMLElement;
        activeCell.click();
        expect(wrapperComponent.startDate()).toEqual(new Date(2022, 2, 19));
      });
    });

    describe('with today button', () => {
      beforeEach(() => {
        wrapperComponent.maxDate.set(getToday());
        fixture.detectChanges();
      });

      it('should go to today', () => {
        const pipeSpy = spyOn(DatePipe.prototype, 'transform');

        (element.querySelector('.today-button') as HTMLElement)!.click();
        fixture.detectChanges();

        const today = getToday();

        expect(pipeSpy).toHaveBeenCalledTimes(2);

        const month = pipeSpy.calls.argsFor(0);
        expect(isSameMonth(month[0] as Date, today)).toBeTrue();
        expect(month[1] as string).toBe('MMMM');

        const year = pipeSpy.calls.argsFor(1);
        expect(isSameYear(year[0] as Date, today)).toBeTrue();
        expect(year[1] as string).toBe('yyyy');

        const activeCell = helper
          .getCalendarBody()
          .querySelector('[cdkfocusinitial]') as HTMLElement;
        expect(activeCell).toBeTruthy();
        expect(activeCell.innerHTML.trim()).toBe(today.getDate().toString());
        expect(isSameDate(wrapperComponent.focusedDate(), today)).toBeTrue();
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
        wrapperComponent.focusedDate.set(date);
        fixture.detectChanges();

        expect(helper.getTodayButton()?.getAttributeNames()).toContain('disabled');
      });

      it('should go to today also when maxDate is before today', async () => {
        const maxDate = getToday();
        maxDate.setDate(-1);
        wrapperComponent.maxDate.set(maxDate);
        fixture.detectChanges();

        helper.getTodayButton().click();
        fixture.detectChanges();

        const today = getToday();

        const activeCell = helper
          .getCalendarBody()
          .querySelector('[cdkfocusinitial]') as HTMLElement;
        expect(activeCell).toBeTruthy();
        expect(activeCell.innerHTML.trim()).toBe(today.getDate().toString());
        expect(isSameDate(wrapperComponent.focusedDate(), today)).toBeTrue();
      });
    });

    describe('with weekStartDay', () => {
      beforeEach(() => {
        wrapperComponent.hideWeekNumbers.set(true);
        fixture.detectChanges();
      });

      it('weekStart should be monday', () => {
        wrapperComponent.weekStartDay.set('monday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)?.textContent!.trim()).toBe('Mon');
        expect(helper.getCells().at(0)?.innerHTML.trim()).toBe('28');
        expect(helper.getCells().at(6)?.innerHTML.trim()).toBe('6');
      });

      it('weekStart should be sunday', () => {
        wrapperComponent.weekStartDay.set('sunday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)?.textContent!.trim()).toBe('Sun');
        expect(helper.getCells().at(0)?.innerHTML.trim()).toBe('27');
        expect(helper.getCells().at(6)?.innerHTML.trim()).toBe('5');
      });

      it('weekStart should be saturday', () => {
        wrapperComponent.weekStartDay.set('saturday');
        fixture.detectChanges();

        const headers = helper.getCalendarHeaders();
        expect(headers.at(0)?.textContent!.trim()).toBe('Sat');
        expect(helper.getCells().at(0)?.innerHTML.trim()).toBe('26');
        expect(helper.getCells().at(6)?.innerHTML.trim()).toBe('4');
      });
    });
  });

  describe('When Range Select View', () => {
    let rangeWrapperComponent: RangeSelectComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(RangeSelectComponent);
      rangeWrapperComponent = fixture.componentInstance;
      element = fixture.nativeElement;
      helper = new CalenderTestHelper(element);
      fixture.detectChanges();
    });

    it('should select range when two cells were clicked', () => {
      selectDate(16);

      let selectedElements = helper.queryAsArray('.selected')!;
      expect(selectedElements.length).toBe(1);
      expect(selectedElements.at(-1)!.innerHTML.trim()).toBe('16');
      expect(isSameDate(rangeWrapperComponent.focusedDate(), new Date('2022-03-16'))).toBeTrue();

      selectDate(31);

      selectedElements = helper.queryAsArray('.selected')!;
      expect(selectedElements.length).toBe(2);
      expect(selectedElements.at(-1)!.innerHTML.trim()).toBe('31');
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
