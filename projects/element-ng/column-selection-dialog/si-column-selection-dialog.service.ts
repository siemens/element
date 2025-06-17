/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import {
  createModalConfig,
  ModalDependencyInjectionOptions,
  ModalOptions,
  SiModalService
} from '@siemens/element-ng/modal';
import { Observable } from 'rxjs';

import { SiColumnSelectionDialogComponent } from './si-column-selection-dialog.component';
import {
  ColumnSelectionDialogResult,
  SiColumnSelectionDialogConfig
} from './si-column-selection-dialog.types';

@Injectable({ providedIn: 'root' })
export class SiColumnSelectionDialogService {
  private modalService = inject(SiModalService);

  /**
   * Opens a column selection dialog.
   *
   * Despite other dialogs,
   * this dialog informs the consumer not ONLY with clicking `submit` or `cancel`,
   * but also with changing the place or visibility of a dialog row
   * thanks to the `instant` type of emitted event.
   *
   * {@label WITH_OBJECT}
   */
  showColumnSelectionDialog(
    dialogConfig: SiColumnSelectionDialogConfig,
    diOptions?: ModalDependencyInjectionOptions
  ): Observable<ColumnSelectionDialogResult> {
    return new Observable<ColumnSelectionDialogResult>(subscriber => {
      const config: ModalOptions<any> = createModalConfig(dialogConfig);
      Object.assign(config, diOptions);

      config.class += ' modal-dialog-scrollable';
      config.keyboard = true;

      const modalRef = this.modalService.show<SiColumnSelectionDialogComponent>(
        SiColumnSelectionDialogComponent,
        config
      );
      const subscription = modalRef.hidden.subscribe(
        (confirmationResult: ColumnSelectionDialogResult | undefined) => {
          const keepModalOpen =
            confirmationResult?.type === 'instant' || confirmationResult?.type === 'restoreDefault';
          confirmationResult ??= { type: 'cancel', columns: modalRef.content.backupColumns };
          subscriber.next(confirmationResult);
          if (!keepModalOpen) {
            subscription.unsubscribe();
            subscriber.complete();
          }
        }
      );

      return () => {
        if (!subscription.closed) {
          subscription.unsubscribe();
          modalRef.detach();
        }
      };
    });
  }
}
