/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model
} from '@angular/core';
import { ExtendedStatusType } from '@siemens/element-ng/common';
import { SiIconNextComponent, STATUS_ICON_CONFIG } from '@siemens/element-ng/icon';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-summary-chip',
  imports: [NgClass, SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-summary-chip.component.html',
  styleUrl: './si-summary-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiSummaryChipComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  /** Status. Alternatively, use {@link icon} and {@link color}. */
  readonly status = input<ExtendedStatusType>();
  /** Icon token, see {@link https://element.siemens.io/icons/element}. */
  readonly icon = input<string>();
  /** Color class, see {@link https://element.siemens.io/typography/#color-variants-classes}. */
  readonly color = input<string>();
  /** Icon token, see {@link https://element.siemens.io/fundamentals/icons/}. */
  readonly stackedIcon = input<string>();
  /** Color class, see {@link https://element.siemens.io/fundamentals/icons/}. */
  readonly stackedColor = input<string>();
  /** The label. */
  readonly label = input.required<TranslatableString>();
  /** Value to display. */
  readonly value = input.required<TranslatableString>();
  /**
   * Selected state, will change when clicked.
   * @defaultValue false
   */
  readonly selected = model(false);
  /**
   * Disabled state.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Whether to hide the label. The label will still be used for screen-readers.
   * @defaultValue false
   */
  readonly hideLabel = input(false, { transform: booleanAttribute });

  protected readonly statusIcon = computed(() => {
    const status = this.status();
    return status
      ? this.statusIcons[status]
      : {
          icon: this.icon(),
          color: this.color(),
          stacked: this.stackedIcon(),
          stackedColor: this.stackedColor()
        };
  });

  protected toggleSelected(): void {
    if (!this.disabled()) {
      this.selected.set(!this.selected());
    }
  }
}
