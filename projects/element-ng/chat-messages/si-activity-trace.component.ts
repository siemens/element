/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, model } from '@angular/core';
import { elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Collapsible container for grouping multiple activity messages.
 *
 * @experimental
 */
@Component({
  selector: 'si-activity-trace',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-activity-trace.component.html',
  styleUrl: './si-activity-trace.component.scss'
})
export class SiActivityTraceComponent {
  /** Trace heading. */
  readonly heading = input.required<TranslatableString>();

  /**
   * Whether the trace content is expanded.
   *
   * @defaultValue false
   */
  readonly expanded = model(false);

  protected readonly icons = addIcons({ elementRight2 });
}
