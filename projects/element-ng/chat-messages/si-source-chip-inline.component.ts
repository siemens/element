/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Inline source chip for AI messages.
 *
 * Renders a compact pill that appears inline with the AI message text, aligned to the
 * paragraph line height (20 px). Clicking the chip should open a popover with the source details.
 *
 * @experimental
 */
@Component({
  selector: 'si-source-chip-inline',
  imports: [SiIconComponent],
  template: `
    @if (icon()) {
      <si-icon class="icon" [icon]="icon()!" />
    }
    <span class="label">{{ label() }}@if (count() > 0) { +{{ count() }}}</span>
  `,
  styleUrl: './si-source-chip-inline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'button',
    tabindex: '0',
    '[class.active]': 'active()',
    '(click)': 'chipClicked.emit()',
    '(keydown.enter)': '$event.preventDefault(); chipClicked.emit()',
    '(keydown.space)': '$event.preventDefault(); chipClicked.emit()'
  }
})
export class SiSourceChipInlineComponent {
  /** The source name displayed as the chip label. Truncated after 24 characters. */
  readonly label = input.required<string>();

  /** Optional icon shown before the label. */
  readonly icon = input<string>();

  /**
   * Number of additional sources beyond the first one.
   * When greater than 0, the chip appends `+{count}` to the label (e.g. "Source name +2").
   * @defaultValue 0
   */
  readonly count = input(0);

  /**
   * Whether the chip is in active (focused/selected) state.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /** Emitted when the chip is clicked or activated via keyboard. */
  readonly chipClicked = output<void>();
}
