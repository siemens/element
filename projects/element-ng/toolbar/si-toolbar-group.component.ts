/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Toolbar } from '@angular/aria/toolbar';
import { Component, computed, inject } from '@angular/core';

/**
 * Groups related items of a {@link SiToolbarComponent} into a section.
 * Consecutive groups are visually separated by a divider.
 *
 * Provide an accessible name for each group by setting the `aria-label` attribute.
 */
@Component({
  selector: 'si-toolbar-group',
  template: '<ng-content />',
  styleUrl: './si-toolbar-group.component.scss',
  host: {
    role: 'group',
    class: 'si-toolbar-group',
    '[class.si-toolbar-group-vertical]': 'vertical()'
  }
})
export class SiToolbarGroupComponent {
  private readonly toolbar = inject(Toolbar);

  protected readonly vertical = computed(() => this.toolbar.orientation() === 'vertical');
}
