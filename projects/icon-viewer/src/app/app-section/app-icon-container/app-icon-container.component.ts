/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input, signal } from '@angular/core';

import { Icon } from '../../icon.service';

@Component({
  selector: 'app-icon-container',
  imports: [],
  templateUrl: './app-icon-container.component.html',
  styleUrl: './app-icon-container.component.scss',
  host: {
    '(click)': 'copyIconName()'
  }
})
export class AppIconContainerComponent {
  readonly icon = input.required<Icon>();
  readonly iconsMargin = input<boolean>(false);
  readonly showFilled = input<boolean>(false);
  readonly displayTags = input<boolean>(false);

  readonly copied = signal<boolean>(false);

  // Computed properties
  readonly iconTags = computed(() => {
    const tags = this.icon().tags;
    return tags ? tags.filter(tag => tag.length).join(', ') : '';
  });

  readonly displayIconName = computed(() => {
    const icon = this.icon();
    const filled = this.showFilled();
    return filled && icon.filledName ? icon.filledName : icon.name;
  });

  readonly iconClass = computed(() => {
    const icon = this.icon();
    const filled = this.showFilled();
    return filled && icon.filledName ? icon.filledName : icon.name;
  });

  readonly displayText = computed(() => (this.copied() ? 'Copied' : this.displayIconName()));

  protected copyIconName(): void {
    navigator.clipboard.writeText(this.displayIconName()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
