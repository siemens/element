/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export interface Column {
  /**
   * Unique id
   */
  id: string;
  /**
   * Title of the column.
   */
  title: string;
  /**
   * Decides if the column is visible to the user.
   */
  visible: boolean;
  /**
   * If true, the order of the column can be changed by dragging it to another position.
   */
  draggable: boolean;
  /**
   * If true, the column is disabled and cannot be interacted with.
   * This means, the user cannot change any of the column options
   * like the visibility etc.
   */
  disabled: boolean;
  /**
   * If true, the {@link title} can be renamed.
   */
  editable?: boolean;
}

export interface SiColumnSelectionDialogConfig {
  heading: TranslatableString;
  bodyTitle: TranslatableString;
  submitBtnName?: TranslatableString;
  cancelBtnName?: TranslatableString;
  restoreToDefaultBtnName?: TranslatableString;
  hiddenText?: TranslatableString;
  visibleText?: TranslatableString;
  columnVisibilityConfigurable?: boolean;
  restoreEnabled?: boolean;
  columns: Column[];
  translationParams?: { [key: string]: any };
  listAriaLabel?: TranslatableString;
  renameInputAriaLabel?: TranslatableString;
  a11yItemMovedMessage?: TranslatableString;
  a11yItemNotMovedMessage?: TranslatableString;
}

export interface ColumnSelectionDialogResult {
  type: ColumnSelectionDialogResultType;
  columns: Column[];
  /** when `type === 'restoreDefault'`, this function is set and allows to provide the columns */
  updateColumns?: (columns: Column[]) => void;
}

/**
 * Emit type of dialog actions.
 *
 * `ok` : Emitted when user submits.
 * `cancel` : Emitted when user clicks cancel.
 * `instant` : Emitted when visibility or place of a row changes.
 *
 * `instant` type is used to reflect the ui changes real time even before closing the dialog.
 */
export type ColumnSelectionDialogResultType = 'ok' | 'cancel' | 'instant' | 'restoreDefault';
