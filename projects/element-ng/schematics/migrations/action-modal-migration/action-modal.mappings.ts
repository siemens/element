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
  parameters: string[]; // paramNames in order of arguments
}

export interface CodeTransformation {
  node: ts.Node;
  newCode: string;
  type: 'method-call' | 'type-reference';
}

export const DIALOG_METHOD_CONFIGS: Record<LegacyMethodName, DialogMethodConfig> = {
  showAlertDialog: {
    type: 'alert',
    parameters: ['message', 'heading', 'confirmBtnName', 'translationParams', 'icon', 'diOptions']
  },

  showConfirmationDialog: {
    type: 'confirmation',
    parameters: [
      'message',
      'heading',
      'confirmBtnName',
      'declineBtnName',
      'translationParams',
      'icon',
      'diOptions'
    ]
  },

  showEditDiscardDialog: {
    type: 'edit-discard',
    parameters: [
      'disableSave',
      'message',
      'heading',
      'saveBtnName',
      'discardBtnName',
      'cancelBtnName',
      'disableSaveMessage',
      'disableSaveDiscardBtnName',
      'translationParams',
      'icon',
      'diOptions'
    ]
  },

  showDeleteConfirmationDialog: {
    type: 'delete-confirm',
    parameters: [
      'message',
      'heading',
      'deleteBtnName',
      'cancelBtnName',
      'translationParams',
      'icon',
      'diOptions'
    ]
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
