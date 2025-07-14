/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import {
  createModalConfig,
  ModalDependencyInjectionOptions,
  SiModalService
} from '@siemens/element-ng/modal';
import { Observable, Subscriber, Subscription, switchMap, take } from 'rxjs';

import {
  ActionDialog,
  ActionDialogReturnType,
  AlertDialogResult,
  ConfirmationDialogResult,
  DeleteConfirmationDialogResult,
  EditDiscardDialogResult
} from './si-action-dialog.types';
import { SiAlertDialogComponent } from './si-alert-dialog/si-alert-dialog.component';
import { SiConfirmationDialogComponent } from './si-confirmation-dialog/si-confirmation-dialog.component';
import { SiDeleteConfirmationDialogComponent } from './si-delete-confirmation-dialog/si-delete-confirmation-dialog.component';
import { SiEditDiscardDialogComponent } from './si-edit-discard-dialog/si-edit-discard-dialog.component';

const ACTION_DIALOG_COMPONENT: Record<ActionDialog['type'], new (...args: any[]) => any> = {
  'alert': SiAlertDialogComponent,
  'confirmation': SiConfirmationDialogComponent,
  'delete-confirm': SiDeleteConfirmationDialogComponent,
  'edit-discard': SiEditDiscardDialogComponent
};

const ACTION_DIALOG_DEFAULT_CLOSE_VALUE: Record<ActionDialog['type'], string> = {
  'alert': 'confirm',
  'confirmation': 'decline',
  'delete-confirm': 'cancel',
  'edit-discard': 'cancel'
};

/**
 * The service provides convenient methods to show common modal dialogs.
 * All return an observable, which emit the dialog results. After emitting,
 * the observables complete. Therefore, clients do not need to unsubscribe.
 */
@Injectable({ providedIn: 'root' })
export class SiActionDialogService {
  private modalService = inject(SiModalService);

  /**
   * Show an alert dialog.
   * @deprecated use `showActionDialog({ type: 'alert', ... })` instead
   */
  showAlertDialog(
    message: string,
    heading?: string,
    confirmBtnName?: string,
    translationParams?: { [key: string]: any },
    icon?: string,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<AlertDialogResult> {
    return this.showActionDialog(
      {
        type: 'alert',
        icon,
        message,
        heading,
        confirmBtnName,
        translationParams
      },
      diOptions
    );
  }

  /**
   * Show a confirmation dialog.
   * @deprecated use `showActionDialog({ type: 'confirmation', ... })` instead
   */
  showConfirmationDialog(
    message: string,
    heading?: string,
    confirmBtnName?: string,
    declineBtnName?: string,
    translationParams?: { [key: string]: any },
    icon?: string,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<ConfirmationDialogResult> {
    return this.showActionDialog(
      {
        type: 'confirmation',
        icon,
        message,
        heading,
        confirmBtnName,
        declineBtnName,
        translationParams
      },
      diOptions
    );
  }

  /**
   * Show an edit dialog with the option to discard.
   * @deprecated use `showActionDialog({ type: 'edit-discard', ... })` instead
   */
  showEditDiscardDialog(
    disableSave?: boolean,
    message?: string,
    heading?: string,
    saveBtnName?: string,
    discardBtnName?: string,
    cancelBtnName?: string,
    disableSaveMessage?: string,
    disableSaveDiscardBtnName?: string,
    translationParams?: { [key: string]: any },
    icon?: string,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<EditDiscardDialogResult> {
    return this.showActionDialog(
      {
        type: 'edit-discard',
        message,
        heading,
        icon,
        disableSave,
        saveBtnName,
        cancelBtnName,
        discardBtnName,
        disableSaveMessage,
        disableSaveDiscardBtnName,
        translationParams
      },
      diOptions
    );
  }

  /**
   * Show a dialog confirming a deletion.
   * @deprecated use `showActionDialog({ type: 'delete-confirm', ... })` instead
   */
  showDeleteConfirmationDialog(
    message?: string,
    heading?: string,
    deleteBtnName?: string,
    cancelBtnName?: string,
    translationParams?: { [key: string]: any },
    icon?: string,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<DeleteConfirmationDialogResult> {
    return this.showActionDialog(
      {
        type: 'delete-confirm',
        icon,
        message,
        heading,
        deleteBtnName,
        cancelBtnName,
        translationParams
      },
      diOptions
    );
  }

  /**
   * Shows an action dialog
   * @param dialog - The dialog configuration
   * @param diOptions - Optional DI configuration.
   * @returns Observable for the result of the dialog. Need to `subscribe()` to show the dialog
   */
  showActionDialog<T extends ActionDialog>(
    dialog: T,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<ActionDialogReturnType<T>> {
    return new Observable<ActionDialogReturnType<T>>(subscriber => {
      const { type, delayDismiss, ...inputs } = dialog;
      const config = createModalConfig(inputs);

      config.keyboard = true;
      config.messageInsteadOfAutoHide = !!delayDismiss;
      Object.assign(config, diOptions);

      const modalRef = this.modalService.show(
        ACTION_DIALOG_COMPONENT[type],
        config,
        ACTION_DIALOG_DEFAULT_CLOSE_VALUE[type] as ActionDialogReturnType<T>
      );

      let subscription: Subscription | undefined;
      if (delayDismiss) {
        // `any`because TS cannot infer types correctly
        subscription = modalRef.message
          .pipe(take(1), switchMap(delayDismiss as any))
          .subscribe(modalRef.hide);
      }
      // ModalRef always allows emitting undefined. But we know that we don't emit undefined here, so do typecast.
      modalRef.hidden.subscribe(subscriber as Subscriber<ActionDialogReturnType<T> | undefined>);

      return () => {
        subscription?.unsubscribe();
        modalRef.detach();
      };
    });
  }
}
