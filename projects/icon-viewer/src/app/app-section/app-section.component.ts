/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';

import { IconCategory } from '../icon.service';
import { AppIconContainerComponent } from './app-icon-container/app-icon-container.component';

@Component({
  selector: 'app-section',
  imports: [AppIconContainerComponent],
  templateUrl: './app-section.component.html',
  styleUrl: './app-section.component.scss'
})
export class AppSectionComponent {
  readonly category = input.required<IconCategory>();
  readonly idPrefix = input<string>('');
  readonly showTitle = input<boolean>(true);
  readonly iconsMargin = input<boolean>(false);
  readonly showFilled = input<boolean>(false);
  readonly displayTags = input<boolean>(false);
  readonly darkTheme = input<boolean>(false);
  readonly dark = input<boolean>(false);

  // Computed properties
  readonly sectionId = computed(() => this.idPrefix() + this.category().title);
}
