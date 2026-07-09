/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { TranslatableString } from '@siemens/element-translate-ng/translate-types';

/**
 * Actions for messages representing an action with icon, label (for accessibility), and handler.
 * Only the icon will be displayed.
 *
 * @see {@link SiChatMessageComponent} for message display and actions rendering
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

/**
 * Source metadata for content references.
 * Rendering is reserved for a follow-up implementation.
 *
 * @experimental
 */
export interface Source {
  id: string;
  label?: string;
  url?: string;
}

/**
 * Structured content block for future message rendering.
 *
 * Initial rendering support focuses on string content. Block rendering is reserved
 * for a follow-up implementation.
 *
 * @experimental
 */
export interface ContentBlock {
  type: 'text' | 'chart' | 'map';
  text?: string;
  data?: unknown;
  sources?: Source[];
}
