/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconService } from '../icon.service';

@Component({
  selector: 'app-menu',
  imports: [NgTemplateOutlet, FormsModule],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss'
})
export class AppMenuComponent {
  // Signal outputs
  readonly searchChanged = output<void>();
  readonly filledToggle = output<boolean>();
  readonly darkToggle = output<boolean>();

  // Signal inputs
  readonly isIconCategory = input<boolean>(false);
  readonly displayIconSetName = input<string>('');
  readonly short = input<boolean>(false);

  private readonly fontService = inject(IconService);

  // Direct references to service signals
  readonly dark = this.fontService.dark;
  readonly filled = this.fontService.filled;
  readonly hasFilled = this.fontService.hasFilled;
  readonly search = this.fontService.generalSearch;

  // Computed properties
  readonly shouldShowHeading = computed(() => !this.isIconCategory() && this.displayIconSetName());
  readonly searchInputClasses = computed(() => ({
    short: this.isIconCategory() || this.short(),
    'has-no-filled': !this.hasFilled()
  }));

  toggleDark(): void {
    if (this.isIconCategory()) {
      const newValue = !this.dark();
      this.darkToggle.emit(newValue);
    } else {
      this.fontService.dark.update((value: boolean) => !value);
    }
  }

  toggleFilled(): void {
    if (this.isIconCategory()) {
      const newValue = !this.filled();
      this.filledToggle.emit(newValue);
    } else {
      this.fontService.filled.update((value: boolean) => !value);
    }
  }

  onSearch(): void {
    this.fontService.setSearch(this.search());
    this.searchChanged.emit();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.onSearch();
  }

  clearSearch(): void {
    this.search.set('');
    this.onSearch();
  }
}
