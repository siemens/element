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

/** State of a trace message. */
export type TraceMessageState = 'running' | 'completed' | 'failed';

let traceMessageId = 0;

/**
 * Displays a meaningful step or phase in an AI activity trace.
 *
 * The marker communicates whether the activity is running, completed, or failed. The message can
 * be expanded to reveal additional projected content such as markdown, metadata, or tool output.
 *
 * @experimental
 */
@Component({
  selector: 'si-trace-message',
  imports: [SiIconComponent, SiLoadingSpinnerComponent, SiTranslatePipe],
  templateUrl: './si-trace-message.component.html',
  styleUrl: './si-trace-message.component.scss',
  host: {
    '[class.trace-running]': `state() === 'running'`,
    '[class.trace-completed]': `state() === 'completed'`,
    '[class.trace-failed]': `state() === 'failed'`,
    '[class.trace-expanded]': 'expanded()'
  }
})
export class SiTraceMessageComponent {
  private readonly stateLabels: Record<TraceMessageState, TranslatableString> = {
    running: t(() => $localize`:@@SI_TRACE_MESSAGE.RUNNING:Running`),
    completed: t(() => $localize`:@@SI_TRACE_MESSAGE.COMPLETED:Completed`),
    failed: t(() => $localize`:@@SI_TRACE_MESSAGE.FAILED:Failed`)
  };

  /** Label describing the activity. */
  readonly label = input.required<TranslatableString>();

  /**
   * Current execution state of the activity.
   *
   * @defaultValue 'completed'
   */
  readonly state = input<TraceMessageState>('completed');

  /**
   * Icon displayed for the activity when it is completed.
   *
   * @defaultValue 'element-record-filled'
   */
  readonly icon = input<string>('element-record-filled');

  /**
   * Whether the trace details are expanded.
   *
   * @defaultValue false
   */
  readonly expanded = model(false);

  protected readonly contentId = `__si-trace-message-${traceMessageId++}-content`;
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
