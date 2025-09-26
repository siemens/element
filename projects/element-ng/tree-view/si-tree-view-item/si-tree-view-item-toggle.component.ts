/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'si-tree-view-item-toggle',
  imports: [SiLoadingSpinnerComponent, NgClass],
  templateUrl: './si-tree-view-item-toggle.component.html',
  styleUrl: './si-tree-view-item-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTreeViewItemToggleComponent {
  /**
   * @defaultValue false
   */
  readonly positionEnd = input(false, {
    transform: booleanAttribute
  });

  /** @defaultValue false */
  readonly disabled = input(false, {
    transform: booleanAttribute
  });

  readonly biggerPaddingStart = input<string>();

  readonly paddingStart = input<string>();

  /** @defaultValue false */
  readonly isExpanding = input(false, {
    transform: booleanAttribute
  });

  readonly folderStateClass = input<string>();

  /** @defaultValue 'si-tree-view-item-dropdown-caret' */
  readonly toggleIcon = input<string>('si-tree-view-item-dropdown-caret');

  /** @defaultValue false */
  readonly spacer = input(false, {
    transform: booleanAttribute
  });

  readonly itemToggled = output<void>();
}
