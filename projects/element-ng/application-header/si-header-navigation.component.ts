/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { elementThumbnails } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiApplicationHeaderComponent } from './si-application-header.component';

@Component({
  selector: 'si-header-navigation',
  imports: [SiTranslatePipe, SiIconComponent],
  templateUrl: './si-header-navigation.component.html',
  host: { class: 'header-navigation', role: 'navigation' }
})
export class SiHeaderNavigationComponent implements OnDestroy {
  protected header = inject(SiApplicationHeaderComponent);
  protected readonly icons = addIcons({ elementThumbnails });

  constructor() {
    this.header.hasNavigation.set(true);
  }

  ngOnDestroy(): void {
    this.header.hasNavigation.set(false);
  }
}
