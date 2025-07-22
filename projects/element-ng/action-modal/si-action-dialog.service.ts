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

import { ActionDialog, ActionDialogReturnType } from './si-action-dialog.types';
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
