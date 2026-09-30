/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { form, FormField, max, min } from '@angular/forms/signals';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiEmptyStateComponent, FormField],
  templateUrl: './si-empty-state-playground.html'
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly settings = signal<{
    responsiveMode: boolean;
    showActions: boolean;
    containerHeight: number;
  }>({
    responsiveMode: true,
    showActions: true,
    containerHeight: 220
  });
  protected readonly settingsForm = form(this.settings, path => {
    min(path.containerHeight, 60);
    max(path.containerHeight, 400);
  });
}
