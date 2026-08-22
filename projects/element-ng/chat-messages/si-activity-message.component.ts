/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input, model } from '@angular/core';
import {
  elementDown2,
  elementRecordFilled,
  elementRight2,
  elementValidationIssue
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

/** State of an activity message. */
export type ActivityMessageState = 'running' | 'completed' | 'failed';

let activityMessageId = 0;

/**
 * Displays a meaningful step or phase in an AI activity.
 *
 * The marker communicates whether the activity is running, completed, or failed. The message can
 * be expanded to reveal additional projected content such as markdown, metadata, or tool output.
 *
 * @experimental
 */
@Component({
  selector: 'si-activity-message',
  imports: [SiIconComponent, SiLoadingSpinnerComponent, SiTranslatePipe],
  templateUrl: './si-activity-message.component.html',
  styleUrl: './si-activity-message.component.scss',
  host: {
    '[class.activity-running]': `state() === 'running'`,
    '[class.activity-completed]': `state() === 'completed'`,
    '[class.activity-failed]': `state() === 'failed'`,
    '[class.activity-expanded]': 'expanded()'
  }
})
export class SiActivityMessageComponent {
  private readonly stateLabels: Record<ActivityMessageState, TranslatableString> = {
    running: t(() => $localize`:@@SI_ACTIVITY_MESSAGE.RUNNING:Running`),
    completed: t(() => $localize`:@@SI_ACTIVITY_MESSAGE.COMPLETED:Completed`),
    failed: t(() => $localize`:@@SI_ACTIVITY_MESSAGE.FAILED:Failed`)
  };

  /** Label describing the activity. */
  readonly label = input.required<TranslatableString>();

  /**
   * Current execution state of the activity.
   *
   * @defaultValue 'completed'
   */
  readonly state = input<ActivityMessageState>('completed');

  /**
   * Icon displayed for the activity when it is completed.
   *
   * @defaultValue 'element-record-filled'
   */
  readonly icon = input<string>('element-record-filled');

  /**
   * Whether the activity details are expanded.
   *
   * @defaultValue false
   */
  readonly expanded = model(false);

  protected readonly contentId = `__si-activity-message-${activityMessageId++}-content`;
  protected readonly headerId = `${this.contentId}-header`;
  protected readonly stateLabel = computed(() => this.stateLabels[this.state()]);

  protected readonly icons = addIcons({
    elementDown2,
    elementRecordFilled,
    elementRight2,
    elementValidationIssue
  });

  protected readonly markerIcon = computed(() => {
    if (this.state() === 'failed') {
      return this.icons.elementValidationIssue;
    }

    return this.icon();
  });
}
