/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { TranslatableString } from '@siemens/element-translate-ng/translate-types';

/**
 * Actions for messages representing an action with icon, label (for accessibility), and handler, for use within {@link SiAiMessageComponent} and {@link SiUserMessageComponent}.
 * Only the icon will be displayed.
 *
 * @see {@link SiAiMessageComponent} for the AI message
 * @see {@link SiUserMessageComponent} for thee user message
 *
 * @experimental
 */
export interface MessageAction {
  /** Label that is shown to the user. */
  label: TranslatableString;
  /**
   * Icon used to represent the action
   */
  icon: string;
  /**
   * Action that is called when the item is triggered.
   */
  action: (actionParam: any, source: this) => void;
  /** Whether the menu item is disabled. */
  disabled?: boolean;
}
