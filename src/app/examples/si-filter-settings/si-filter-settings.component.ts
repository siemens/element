/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, Input, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
@Component({
  selector: 'app-filter-settings',
  imports: [SiCardComponent, FormsModule],
  templateUrl: './si-filter-settings.component.html'
})
export class SiFilterSettingsComponent {
  @Input() variant: BackgroundColorVariant = 'base-1';
  readonly variantChange = output<BackgroundColorVariant>();

  @Input({ transform: booleanAttribute }) disabled = false;
  readonly disabledChange = output<boolean>();

  @Input({ transform: booleanAttribute }) showIcon?: boolean;
  readonly showIconChange = output<boolean>();

  @Input({ transform: booleanAttribute }) disableFreeTextSearch = false;
  readonly disableFreeTextSearchChange = output<boolean>();

  updateInput(field: 'variant' | 'disabled' | 'showIcon' | 'disableFreeTextSearch'): void {
    if (field) {
      (this[`${field}Change` as keyof SiFilterSettingsComponent] as OutputEmitterRef<any>).emit(
        this[field]
      );
    }
  }
}
