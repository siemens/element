/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export class CalendarTestHelper {
  constructor(private element: HTMLElement) {}

  queryAsArray(query: string): HTMLElement[] {
    return Array.from(this.element.querySelectorAll(query)) as HTMLElement[];
  }

  getCells(): HTMLElement[] {
    return this.queryAsArray('.si-calendar-date-cell');
  }

  /** Get only cells which are enabled and aren't a preview. */
  getEnabledCells(): HTMLElement[] {
    return this.queryAsArray('.si-calendar-date-cell:not(.disabled):not(.text-secondary)');
  }

  getDisabledCells(): HTMLElement[] {
    return this.queryAsArray('.si-calendar-date-cell.disabled');
  }

  getEnabledCellWithText(text: string): HTMLElement | undefined {
    return this.getEnabledCells()
      .filter(c => c.innerHTML.trim() === text)
      .at(0);
  }

  getCalendarHeaders(): HTMLElement[] {
    return this.queryAsArray('.si-calendar-table-header th');
  }

  getCalendarBody(): HTMLElement {
    return this.element.querySelector('.si-calendar-body') as HTMLElement;
  }

  getRowLabels(): HTMLElement[] {
    return this.queryAsArray('.si-calendar-row-label') as HTMLElement[];
  }

  clickEnabledCell(text: string): void {
    this.getEnabledCellWithText(text)?.click();
  }

  getActiveCell(): HTMLElement | null {
    const activeCell = this.element.querySelector<HTMLElement>('[cdkfocusinitial]');
    expect(activeCell).toBeTruthy();
    return activeCell;
  }

  getSelectedCells(): HTMLElement[] {
    const selectedCells = this.queryAsArray('.selected') as HTMLElement[];
    expect(selectedCells).toBeTruthy();
    return selectedCells;
  }

  getPreviousButton(): HTMLElement {
    const previousButton = this.element.querySelector('.previous-button');
    expect(previousButton).toBeTruthy();
    return previousButton as HTMLElement;
  }

  getNextButton(): HTMLElement {
    const previousButton = this.element.querySelector('.next-button');
    expect(previousButton).toBeTruthy();
    return previousButton as HTMLElement;
  }

  getOpenMonthViewLink(): HTMLElement {
    const openMonthViewButton = this.element.querySelector('.open-month-view') as HTMLElement;
    expect(openMonthViewButton).toBeTruthy();
    return openMonthViewButton;
  }

  getOpenYearViewLink(): HTMLElement {
    const openYearViewButton = this.element.querySelector('.open-year-view') as HTMLElement;
    expect(openYearViewButton).toBeTruthy();
    return openYearViewButton;
  }

  getConsiderTimeSwitch(): HTMLElement {
    return this.element.querySelector('.form-switch input') as HTMLElement;
  }

  getTimeInputHours(): HTMLInputElement {
    return this.element.querySelector('si-timepicker input[name="hours"]') as HTMLInputElement;
  }

  getTimeInputMinutes(): HTMLInputElement {
    return this.element.querySelector('si-timepicker input[name="minutes"]') as HTMLInputElement;
  }

  getTimeInputSeconds(): HTMLInputElement {
    return this.element.querySelector('si-timepicker input[name="seconds"]') as HTMLInputElement;
  }

  getTodayButton(): HTMLButtonElement {
    return this.element.querySelector('.today-button') as HTMLButtonElement;
  }
}

export const generateKeyEvent = (key: string): KeyboardEvent => {
  const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

export const backdropClick = async (fixture: any): Promise<void> => {
  const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
  backdrop.click();
  fixture.detectChanges();
  await fixture.whenStable();
};

export const enterValue = (input: HTMLInputElement, value: string): void => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

export const dispatchEvents = (element: HTMLElement, events: string[]): void => {
  events.forEach(e => element.dispatchEvent(new Event(e)));
};
