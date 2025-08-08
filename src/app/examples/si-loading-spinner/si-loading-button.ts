/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { LOG_EVENT } from '@siemens/live-preview';
import { SiFormItemComponent } from 'projects/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, FormsModule, SiFormItemComponent, SiLoadingButtonComponent],
  templateUrl: './si-loading-button.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  loading = false;

  handleClick(msg: string): void {
    this.logEvent(msg);
    this.loading = true;
  }
}
