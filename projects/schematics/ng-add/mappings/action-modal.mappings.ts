/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import ts from 'typescript';

export const ACTION_MODAL_SYMBOLS: string[] = [
  'AlertDialogResult',
  'ConfirmationDialogResult',
  'DeleteConfirmationDialogResult',
  'EditDiscardDialogResult',
  'SiActionDialogService'
] as const;

export const LEGACY_METHODS = [
  'showAlertDialog',
  'showConfirmationDialog',
  'showEditDiscardDialog',
  'showDeleteConfirmationDialog'
] as const;

export type LegacyMethodName = (typeof LEGACY_METHODS)[number];

export interface DialogMethodConfig {
  type: string;
  parameters: Record<string, number>; // paramName -> argIndex
}

export interface CodeTransformation {
  node: ts.Node;
  newCode: string;
  type: 'method-call' | 'type-reference';
}

export const DIALOG_METHOD_CONFIGS: Record<LegacyMethodName, DialogMethodConfig> = {
  showAlertDialog: {
    type: 'alert',
    parameters: {
      message: 0,
      heading: 1,
      confirmBtnName: 2,
      translationParams: 3,
      icon: 4,
      diOptions: 5
    }
  },

  showConfirmationDialog: {
    type: 'confirmation',
    parameters: {
      message: 0,
      heading: 1,
      confirmBtnName: 2,
      declineBtnName: 3,
      translationParams: 4,
      icon: 5,
      diOptions: 6
    }
  },

  showEditDiscardDialog: {
    type: 'edit-discard',
    parameters: {
      disableSave: 0,
      message: 1,
      heading: 2,
      saveBtnName: 3,
      discardBtnName: 4,
      cancelBtnName: 5,
      disableSaveMessage: 6,
      disableSaveDiscardBtnName: 7,
      translationParams: 8,
      icon: 9,
      diOptions: 10
    }
  },

  showDeleteConfirmationDialog: {
    type: 'delete-confirm',
    parameters: {
      message: 0,
      heading: 1,
      deleteBtnName: 2,
      cancelBtnName: 3,
      translationParams: 4,
      icon: 5,
      diOptions: 6
    }
  }
};

export const ACTION_DIALOG_TYPES_REPLACEMENTS = [
  // Alert dialog
  {
    old: 'AlertDialogResult.Confirm',
    new: 'confirm'
  },

  // Edit discard dialog
  {
    old: 'EditDiscardDialogResult.Save',
    new: 'save'
  },
  {
    old: 'EditDiscardDialogResult.Discard',
    new: 'discard'
  },
  {
    old: 'EditDiscardDialogResult.Cancel',
    new: 'cancel'
  },

  // Confirmation dialog
  {
    old: 'ConfirmationDialogResult.Confirm',
    new: 'confirm'
  },
  { old: 'ConfirmationDialogResult.Decline', new: 'decline' },

  // Delete confirmation dialog
  {
    old: 'DeleteConfirmationDialogResult.Delete',
    new: 'delete'
  },
  {
    old: 'DeleteConfirmationDialogResult.Cancel',
    new: 'cancel'
  }
];
