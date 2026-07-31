/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { DeleteConfirmationDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-delete-confirmation-dialog',
  imports: [AsyncPipe, SiIconComponent, SiTranslatePipe, SiLoadingButtonComponent],
  templateUrl: './si-delete-confirmation-dialog.component.html'
})
export class SiDeleteConfirmationDialogComponent {
  /** ID of the dialog title element used for accessible naming. */
  readonly titleId = input<string>();
  /**
   * Heading displayed in the dialog.
   * @defaultValue ''
   */
  readonly heading = input<TranslatableString>('');
  /**
   * Message displayed in the dialog.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.MESSAGE:Do you really want to delete the selected elements?`)
   * ```
   */
  readonly message = input(
    t(
      () =>
        $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.MESSAGE:Do you really want to delete the selected elements?`
    )
  );
  /**
   * Label displayed on the delete button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.DELETE_BTN:Delete`)
   * ```
   */
  readonly deleteBtnName = input(
    t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.DELETE_BTN:Delete`)
  );
  /**
   * Label displayed on the cancel button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.CANCEL_BTN:Cancel`)
   * ```
   */
  readonly cancelBtnName = input(
    t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.CANCEL_BTN:Cancel`)
  );
  /**
   * Parameters interpolated into the translated heading and message.
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly translationParams = input<{ [key: string]: any }>({});
  /**
   * Icon displayed next to the dialog content.
   * @defaultValue ''
   */
  readonly icon = input('');

  protected modalRef = inject(
    ModalRef<SiDeleteConfirmationDialogComponent, DeleteConfirmationDialogResult>
  );
  protected loading$ = this.modalRef.message.pipe(take(1));
  protected readonly icons = addIcons({ elementCancel });
}
