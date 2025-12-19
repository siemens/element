/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCalendarButtonComponent, SiDatepickerDirective } from '@siemens/element-ng/datepicker';
import { IDateAngularComp } from 'ag-grid-angular';
import { IDateParams } from 'ag-grid-community';

import { SiFormItemComponent } from '../form';

/**
 * Custom AG Grid date component using Element datepicker.
 * This component replaces the native HTML date input with the Element design system datepicker.
 */
@Component({
  selector: 'si-ag-date-input',
  imports: [
    CommonModule,
    FormsModule,
    SiDatepickerDirective,
    SiCalendarButtonComponent,
    SiFormItemComponent
  ],
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
export class AgDateInputComponent implements IDateAngularComp, OnDestroy {
  /**
   * The selected date value
   */
  public date: Date | undefined = undefined;

  private params!: IDateParams;
  private documentClickListener?: (event: MouseEvent) => void;

  onDateChange(): void {
    if (this.params) {
      this.params.onDateChanged();
    }
  }

  afterGuiAttached(): void {
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

  setDate(date: Date | null): void {
    this.date = date ?? undefined;
    if (this.params) {
      this.params.onDateChanged();
    }
  }
}
