/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model
} from '@angular/core';
import { ExtendedStatusType, STATUS_ICON } from '@siemens/element-ng/common';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-summary-widget',
  imports: [SiIconComponent, SiTranslateModule],
  templateUrl: './si-summary-widget.component.html',
  styleUrl: './si-summary-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiSummaryWidgetComponent {
  /** Status. Alternatively, use {@link icon} and {@link color}. */
  readonly status = input<ExtendedStatusType>();
  /** Icon token, see {@link https://element.siemens.io/icons/element}. */
  readonly icon = input<string>();
  /** Color class, see {@link https://element.siemens.io/fundamentals/typography/#color-variants-classes}. */
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
   * Readonly state.
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Disabled state.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly interactive = computed(() => !this.disabled() && !this.readonly());

  protected readonly statusIcon = computed(() => {
    const status = this.status();
    return status
      ? STATUS_ICON[status]
      : {
          icon: this.icon(),
          color: this.color(),
          stacked: this.stackedIcon(),
          stackedColor: this.stackedColor()
        };
  });

  protected toggleSelected(): void {
    if (this.interactive()) {
      this.selected.set(!this.selected());
    }
  }
}
