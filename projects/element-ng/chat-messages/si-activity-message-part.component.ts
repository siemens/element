/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input, model } from '@angular/core';
import { elementCircleFilled, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Titled content part for use inside an activity message.
 *
 * @experimental
 */
@Component({
  selector: 'si-activity-message-part',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-activity-message-part.component.html',
  styleUrl: './si-activity-message-part.component.scss'
})
export class SiActivityMessagePartComponent {
  /** Part heading. */
  readonly heading = input.required<TranslatableString>();

  /**
   * Whether the part can be collapsed and expanded.
   *
   * @defaultValue false
   */
  readonly collapsible = input(false, { transform: booleanAttribute });

  /**
   * Whether collapsible content is expanded.
   *
   * @defaultValue true
   */
  readonly expanded = model(true);

  protected readonly icons = addIcons({ elementCircleFilled, elementRight2 });
}
