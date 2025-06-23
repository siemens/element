/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
@Component({
  selector: 'app-filter-settings',
  templateUrl: './si-filter-settings.component.html',
  imports: [SiCardComponent, FormsModule]
})
export class SiFilterSettingsComponent {
  @Input() variant: BackgroundColorVariant = 'base-1';
  @Output() readonly variantChange = new EventEmitter<BackgroundColorVariant>();

  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() readonly disabledChange = new EventEmitter<boolean>();

  @Input({ transform: booleanAttribute }) showIcon?: boolean;
  @Output() readonly showIconChange = new EventEmitter<boolean>();

  @Input({ transform: booleanAttribute }) disableFreeTextSearch = false;
  @Output() readonly disableFreeTextSearchChange = new EventEmitter<boolean>();

  updateInput(field: 'variant' | 'disabled' | 'showIcon' | 'disableFreeTextSearch'): void {
    if (field) {
      (this[`${field}Change` as keyof SiFilterSettingsComponent] as EventEmitter<any>).emit(
        this[field]
      );
    }
  }
}
