/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCalendarButtonComponent, SiDatepickerDirective } from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { IDateComp, IDateParams } from 'ag-grid-community';

/**
 * Custom AG Grid date component using Element datepicker.
 * This component replaces the native HTML date input with the Element design system datepicker.
 */
@Component({
  selector: 'si-ag-date-input',
  imports: [FormsModule, SiDatepickerDirective, SiCalendarButtonComponent, SiFormItemComponent],
  template: `
    <si-form-item>
      <si-calendar-button class="w-100">
        <input
          type="text"
          class="form-control"
          siDatepicker
          [autoClose]="true"
          [(ngModel)]="date"
          (ngModelChange)="onDateChange()"
        />
      </si-calendar-button>
    </si-form-item>
  `
})
export class AgDateInputComponent implements IDateComp, OnDestroy {
  private elementRef = inject(ElementRef);

  /**
   * The selected date value.
   */
  public date: Date | undefined = undefined;

  /**
   * AG Grid date filter parameters.
   * @internal
   */
  private params!: IDateParams;

  /**
   * Document click event listener for calendar overlay.
   * @internal
   */
  private documentClickListener?: (event: MouseEvent) => void;

  /**
   * Notifies AG Grid when the date value changes.
   * @internal
   */
  onDateChange(): void {
    if (this.params) {
      this.params.onDateChanged();
    }
  }

  /**
   * Lifecycle hook called after the component GUI is attached.
   * Sets up event listeners to prevent filter popup from closing when interacting with calendar.
   */
  afterGuiAttached(): void {
    // Remove any existing listener to prevent duplicates
    if (this.documentClickListener) {
      document.removeEventListener('mousedown', this.documentClickListener, true);
    }

    // Intercept document click events to keep the filter open when clicking the calendar
    this.documentClickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const calendarOverlay = target.closest('si-datepicker, .cdk-overlay-pane');

      if (calendarOverlay) {
        event.stopPropagation();
      }
    };
    document.addEventListener('mousedown', this.documentClickListener, true);
  }

  ngOnDestroy(): void {
    if (this.documentClickListener) {
      document.removeEventListener('mousedown', this.documentClickListener, true);
    }
  }

  agInit(params: IDateParams): void {
    this.params = params;
  }

  getDate(): Date | null {
    return this.date ?? null;
  }

  getGui(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  setDate(date: Date | null): void {
    this.date = date ?? undefined;
    if (this.params) {
      this.params.onDateChanged();
    }
  }
}
