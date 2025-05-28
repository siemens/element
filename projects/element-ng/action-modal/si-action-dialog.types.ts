/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/naming-convention */
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { Observable } from 'rxjs';

/** @deprecated Will be removed in a future release. Use the string values directly. */

export const AlertDialogResult = {
  Confirm: 'confirm'
} as const;

export type AlertDialogResult = (typeof AlertDialogResult)[keyof typeof AlertDialogResult];

/** @deprecated Will be removed in a future release. Use the string values directly. */
export const EditDiscardDialogResult = {
  Save: 'save',
  Discard: 'discard',
  Cancel: 'cancel'
} as const;

export type EditDiscardDialogResult =
  (typeof EditDiscardDialogResult)[keyof typeof EditDiscardDialogResult];

/** @deprecated Will be removed in a future release. Use the string values directly. */
export const ConfirmationDialogResult = {
  Confirm: 'confirm',
  Decline: 'decline'
} as const;

export type ConfirmationDialogResult =
  (typeof ConfirmationDialogResult)[keyof typeof ConfirmationDialogResult];

/** @deprecated Will be removed in a future release. Use the string values directly. */
export const DeleteConfirmationDialogResult = {
  Delete: 'delete',
  Cancel: 'cancel'
} as const;

export type DeleteConfirmationDialogResult =
  (typeof DeleteConfirmationDialogResult)[keyof typeof DeleteConfirmationDialogResult];

/**
 * Base type for all action dialogs
 * @typeParam TResult - Type of the dialog result.
 */
interface ActionDialogBase<TResult> {
  /** The message. */
  message?: TranslatableString;
  /** The heading. */
  heading?: TranslatableString;
  /** Icon displayed in the heading. */
  icon?: string;
  /** Parameters for the translate pipe. */
  translationParams?: Record<string, any>;
  /**
   * Callback for delaying dismiss with a progress indicator until the
   * returned {@link Observable} emits.
   */
  delayDismiss?: (result: TResult) => Observable<TResult>;
}

/** An action dialog showing an alert */
export interface AlertDialog extends ActionDialogBase<AlertDialogResult> {
  type: 'alert';
  /** Label of the confirmation button. */
  confirmBtnName?: TranslatableString;
}

/** An action dialog for a confirmation. */
export interface ConfirmationDialog extends ActionDialogBase<ConfirmationDialogResult> {
  type: 'confirmation';
  /** Label of the confirmation button. */
  confirmBtnName?: TranslatableString;
  /** Label of the decline button. */
  declineBtnName?: TranslatableString;
}

/** An action dialog for an edit/discard prompt. */
export interface EditDiscardDialog extends ActionDialogBase<EditDiscardDialogResult> {
  type: 'edit-discard';
  /** Whether to disable the save button. */
  disableSave?: boolean;
  /** Label of the save button. */
  saveBtnName?: TranslatableString;
  /** Label of the discard button. */
  discardBtnName?: TranslatableString;
  /** Label of the cancel button. */
  cancelBtnName?: TranslatableString;
  /** Message when {@link disableSave} is set. */
  disableSaveMessage?: TranslatableString;
  /** Label of the discard button when {@link disableSave} is set. */
  disableSaveDiscardBtnName?: TranslatableString;
}

/** An action dialog for a delete confirmation. */
export interface DeleteConfirmationDialog extends ActionDialogBase<DeleteConfirmationDialogResult> {
  type: 'delete-confirm';
  /** Label of the delete button. */
  deleteBtnName?: TranslatableString;
  /** Label of the cancel button. */
  cancelBtnName?: TranslatableString;
}

/** All possible action dialogs. */
export type ActionDialog =
  | AlertDialog
  | ConfirmationDialog
  | EditDiscardDialog
  | DeleteConfirmationDialog
  | never;

/** Returns the return value type for the given action dialog type */
export type ActionDialogReturnType<T extends ActionDialogBase<any>> = T extends AlertDialog
  ? AlertDialogResult
  : T extends ConfirmationDialog
    ? ConfirmationDialogResult
    : T extends EditDiscardDialog
      ? EditDiscardDialogResult
      : T extends DeleteConfirmationDialog
        ? DeleteConfirmationDialogResult
        : never;
