/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getLocaleMonthNames } from '../date-time-helper';
import { SiDatepickerModule } from '../si-datepicker.module';
import { SiMonthSelectionComponent as TestComponent } from './si-month-selection.component';
import { CalenderTestHelper, generateKeyEvent } from './test-helper.spec';

@Component({
  imports: [SiDatepickerModule, A11yModule, TestComponent],
  template: `<si-month-selection
    previousLabel="Previous Year"
    nextLabel="Next Year"
    [startDate]="startDate()"
    [months]="months()"
    [minDate]="minDate()"
    [maxDate]="maxDate()"
    [focusedDate]="focusedDate()"
    (focusedDateChange)="focusedDate.set($event)"
    (selectedValueChange)="selectionChange($event)"
    (viewChange)="viewChange($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly focusedDate = signal(new Date(2022, 2, 26));
  readonly startDate = signal(new Date(2022, 2, 25));
  readonly months = signal(getLocaleMonthNames('en'));
  readonly minDate = signal<Date | undefined>(undefined);
  readonly maxDate = signal<Date | undefined>(undefined);
  view?: string;
  activeMonth?: Date;
  cancelled = false;

  selectionChange(selection?: Date): void {
    if (selection) {
      this.startDate.set(selection);
      this.focusedDate.set(selection);
    } else {
      this.cancelled = true;
    }
  }
  activeMonthChange(current: Date): void {
    this.activeMonth = current;
  }
  viewChange(view: 'year'): void {
    this.view = view;
  }
}

describe('SiMonthSelectionComponent', () => {
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

  it('should contain all months', () => {
    const months = helper.getEnabledCells();

    expect(months.length).toBe(12);
  });

  it('shows selected month', () => {
    const expected = wrapperComponent.months().at(wrapperComponent.focusedDate().getMonth());
    const selectedElement = element.querySelector('.selected')!;
    expect(selectedElement.innerHTML.trim()).toBe(expected!);
  });

  it('should mark active date', () => {
    const expected = wrapperComponent.months().at(wrapperComponent.focusedDate().getMonth());
    const activeCell = helper.getEnabledCellWithText(expected!);
    expect(activeCell?.hasAttribute('cdkfocusinitial')).toBeTrue();
  });

  it('should focus active date', () => {
    const expected = wrapperComponent.months().at(wrapperComponent.focusedDate().getMonth());
    const activeCell = helper.getEnabledCellWithText(expected!);
    expect(activeCell?.hasAttribute('cdkFocusInitial')).toBeTruthy();
    expect(activeCell?.getAttribute('tabindex')).toContain('0');
  });

  it('should update focusedDate and takeover date on focus', () => {
    helper.getEnabledCells().at(0)?.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 0, 26));
  });

  it('should emit viewChange', () => {
    helper.getOpenYearViewLink().click();

    expect(wrapperComponent.view).toBe('year');
  });

  describe('with previous button', () => {
    const getButton = (): HTMLElement => helper.getPreviousButton();

    it('click should change focusedDate to previous year', () => {
      getButton().click();
      fixture.detectChanges();

      expect(helper.getOpenYearViewLink()?.innerHTML.trim()).toBe('2021');
    });

    it('should be disabled when minDate same year', () => {
      wrapperComponent.minDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when minDate after focusedDate', () => {
      wrapperComponent.minDate.set(new Date(2023, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn?.getAttribute('aria-label')).toBe('Previous Year');
    });
  });

  describe('with next button', () => {
    const getButton = (): HTMLElement => helper.getNextButton();

    it('click should change focusedDate to next year', () => {
      getButton().click();
      fixture.detectChanges();

      expect(helper.getOpenYearViewLink()?.innerHTML.trim()).toBe('2023');
    });

    it('should be disabled when maxDate same year', () => {
      wrapperComponent.maxDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should be disabled when maxDate before focusedDate', () => {
      wrapperComponent.maxDate.set(new Date(2021, 0, 1));
      fixture.detectChanges();

      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('disabled');
      expect(btn?.getAttributeNames()).not.toContain('tabindex');
    });

    it('should have aria-label', () => {
      const btn = getButton();
      expect(btn?.getAttributeNames()).toContain('aria-label');
      expect(btn?.getAttribute('aria-label')).toBe('Next Year');
    });
  });

  describe('a11y', () => {
    it('should have month and year as aria-label', () => {
      const monthCells = helper.getEnabledCells();
      let index = 0;
      monthCells.forEach(cell => {
        const label = cell.getAttribute('aria-label');
        const expected = `${
          wrapperComponent.months()[index]
        } ${wrapperComponent.focusedDate().getFullYear()}`;

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

      expect(wrapperComponent.cancelled).toBeTrue();
    });

    it('should decrement month on left arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 1, 26));
    });

    it('should increment month on right arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 3, 26));
    });

    it('should decrement year and move to december on left arrow press', () => {
      wrapperComponent.focusedDate.set(new Date(2022, 0, 1));
      fixture.detectChanges();

      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowLeft'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2021, 11, 1));
    });

    it('should increment year and move to january on right arrow press', () => {
      wrapperComponent.focusedDate.set(new Date(2022, 11, 1));
      fixture.detectChanges();

      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowRight'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2023, 0, 1));
    });

    it('should go up a row on up arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 0, 26));
    });

    it('should go down a row on down arrow press', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowDown'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 4, 26));
    });

    it('should select focused date on click', () => {
      calendarBodyElement.dispatchEvent(generateKeyEvent('ArrowUp'));
      fixture.detectChanges();

      expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 0, 26));

      const activeCell = calendarBodyElement.querySelector('[cdkfocusinitial]') as HTMLElement;
      activeCell.click();
      expect(wrapperComponent.startDate()).toEqual(new Date(2022, 0, 1));
    });
  });

  describe('range test', () => {
    beforeEach(() => {
      wrapperComponent.minDate.set(new Date(2022, 1, 25));
      wrapperComponent.maxDate.set(new Date(2022, 10, 25));
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
        expect(wrapperComponent.startDate()).toEqual(new Date(2022, 2, 25));
        expect(wrapperComponent.focusedDate()).toEqual(new Date(2022, 2, 26));
      });
    });
  });
});
