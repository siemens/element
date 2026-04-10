/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Represents a single selected value inside an {@link SiSelectComboboxComponent}.
 *
 * Project one `<si-select-combobox-value>` per selected entry. Optional
 * `icon`, `iconColor`, `stackedIcon` and `stackedIconColor` inputs mirror the
 * icon API of {@link SelectOption} and render an icon (with optional stacked
 * overlay) before the projected content.
 *
 * Add the `comma-separated` CSS class to render a comma between adjacent
 * values. Omit it when using chips, custom separators, or a single value.
 *
 * @example
 * ```html
 * <si-select-combobox>
 *   <si-select-combobox-value
 *     icon="element-face-happy"
 *     iconColor="status-success"
 *   >
 *     {{ select.value() }}
 *   </si-select-combobox-value>
 * </si-select-combobox>
 * ```
 *
 * @experimental
 */
@Component({
  selector: 'si-select-combobox-value',
  imports: [SiIconComponent],
  template: `
    @if (icon(); as iconName) {
      <div class="icon-stack icon me-2 my-n4">
        <si-icon [icon]="iconName" [class]="iconColor() ?? ''" />
        @if (stackedIcon(); as stackedIconName) {
          <si-icon [icon]="stackedIconName" [class]="stackedIconColor() ?? ''" />
        }
      </div>
    }
    <ng-content />
  `,
  styleUrl: './si-select-combobox-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'text-nowrap'
  }
})
export class SiSelectComboboxValueComponent {
  /** An optional icon rendered before the projected content. */
  readonly icon = input<string>();

  /** Optional CSS color class applied to {@link icon}. */
  readonly iconColor = input<string>();

  /** Optional secondary icon stacked on top of {@link icon}. */
  readonly stackedIcon = input<string>();

  /** Optional CSS color class applied to {@link stackedIcon}. */
  readonly stackedIconColor = input<string>();
}
