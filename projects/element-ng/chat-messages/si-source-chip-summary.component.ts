/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { elementGlobal } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

/**
 * Summary source chip for AI messages.
 *
 * Renders a single "Sources" pill with a globe icon at the end of an AI message,
 * alongside the action buttons. Represents all sources cited in the message.
 * Clicking the chip should open a popover listing the individual sources.
 *
 * @experimental
 */
@Component({
  selector: 'si-source-chip-summary',
  imports: [SiIconComponent, SiTranslatePipe],
  template: `
    <si-icon class="icon" [icon]="icons.elementGlobal" />
    <span class="label">{{ label() | translate }}</span>
  `,
  styleUrl: './si-source-chip-summary.component.scss',
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
export class SiSourceChipSummaryComponent {
  protected readonly icons = addIcons({ elementGlobal });

  /**
   * The label shown on the chip.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_SOURCE_CHIP.SOURCES:Sources`)
   * ```
   */
  readonly label = input(t(() => $localize`:@@SI_AI_SOURCE_CHIP.SOURCES:Sources`));

  /**
   * Whether the chip is in active (focused/selected) state.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /** Emitted when the chip is clicked or activated via keyboard. */
  readonly chipClicked = output<void>();
}
