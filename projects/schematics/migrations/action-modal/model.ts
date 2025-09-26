/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

export const ACTION_DIALOG_SYMBOLS: string[] = [
  'ConfirmationDialogResult',
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
    type: 'confirm', // Fixed: was 'confirmation'
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
    type: 'edit', // Fixed: was 'edit-discard'
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
    type: 'delete', // Fixed: was 'delete-confirmation'
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
