/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, model } from '@angular/core';
import { elementCircleFilled, elementIssue, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Collapsible activity message for displaying progress and intermediate steps in a chat.
 *
 * @experimental
 */
@Component({
  selector: 'si-activity-message',
  imports: [SiIconComponent, SiLoadingSpinnerComponent, SiTranslatePipe],
  templateUrl: './si-activity-message.component.html',
  styleUrl: './si-activity-message.component.scss',
  host: {
    '[class.expanded]': 'expanded()',
    '[class.failed]': `state() === 'failed'`
  }
})
export class SiActivityMessageComponent {
  /** Activity heading. */
  readonly heading = input.required<TranslatableString>();

  /** Activity icon. */
  readonly icon = input<string>();

  /** Current state of the activity. */
  readonly state = input<'running' | 'failed'>();

  /**
   * Whether the activity details are expanded.
   *
   * @defaultValue false
   */
  readonly expanded = model(false);

  protected readonly icons = addIcons({
    elementCircleFilled,
    elementIssue,
    elementRight2
  });
}
