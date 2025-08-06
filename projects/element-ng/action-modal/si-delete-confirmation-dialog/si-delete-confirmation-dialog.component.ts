/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { DeleteConfirmationDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-delete-confirmation-dialog',
  imports: [AsyncPipe, SiIconNextComponent, SiTranslatePipe, SiLoadingButtonComponent],
  templateUrl: './si-delete-confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiDeleteConfirmationDialogComponent {
  readonly titleId = input<string>();
  /** @defaultValue '' */
  readonly heading = input<TranslatableString>('');
  /**
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
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.DELETE_BTN:Delete`)
   * ```
   */
  readonly deleteBtnName = input(
    t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.DELETE_BTN:Delete`)
  );
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.CANCEL_BTN:Cancel`)
   * ```
   */
  readonly cancelBtnName = input(
    t(() => $localize`:@@SI_DELETE_CONFIRMATION_DIALOG.CANCEL_BTN:Cancel`)
  );
  /**
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly translationParams = input<{ [key: string]: any }>({});
  /** @defaultValue '' */
  readonly icon = input('');

  protected modalRef = inject(
    ModalRef<SiDeleteConfirmationDialogComponent, DeleteConfirmationDialogResult>
  );
  protected loading$ = this.modalRef.message.pipe(take(1));
}
