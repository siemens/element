/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { EntityStatusType, MenuItem } from '@siemens/element-ng/common';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** @deprecated Use the new `si-application-header` instead. */
export interface AccountItem extends MenuItem {
  /**
   * Full name of user
   */
  title: string; // title is also in MenuItem. Make it required here.
  /**
   * Initials to be displayed as avatar if no `icon` and also no `image` are provided.
   * If also no initials are provided, they will be automatically calculated from the `title`.
   */
  initials?: string;
  /**
   * The status (success, info, warning, caution, danger, critical, pending, progress) to be
   * visualized.
   */
  avatarStatus?: EntityStatusType;
  /**
   * aria-label for avatar status
   */
  avatarStatusAriaLabel?: TranslatableString;
  /**
   * Email address of the user
   */
  email?: string;
  /**
   * Name of the Company
   */
  company?: string;
  /**
   * Role name shown as a badge in the bottom
   */
  role?: string;
}
