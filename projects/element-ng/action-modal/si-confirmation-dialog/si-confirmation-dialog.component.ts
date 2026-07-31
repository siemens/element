/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { ConfirmationDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-confirmation-dialog',
  imports: [AsyncPipe, SiIconComponent, SiTranslatePipe, SiLoadingButtonComponent],
  templateUrl: './si-confirmation-dialog.component.html'
})
export class SiConfirmationDialogComponent {
  /** ID of the dialog title element used for accessible naming. */
  readonly titleId = input<string>();
  /**
   * Heading displayed in the dialog.
   * @defaultValue ''
   */
  readonly heading = input<TranslatableString>('');
  /**
   * Message displayed in the dialog.
   * @defaultValue ''
   */
  readonly message = input<TranslatableString>('');
  /**
   * Label displayed on the confirmation button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CONFIRMATION_DIALOG.YES:Yes`)
   * ```
   */
  readonly confirmBtnName = input(t(() => $localize`:@@SI_CONFIRMATION_DIALOG.YES:Yes`));
  /**
   * Label displayed on the decline button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CONFIRMATION_DIALOG.NO:No`)
   * ```
   */
  readonly declineBtnName = input(t(() => $localize`:@@SI_CONFIRMATION_DIALOG.NO:No`));
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

  protected modalRef = inject(ModalRef<SiConfirmationDialogComponent, ConfirmationDialogResult>);
  protected loading$ = this.modalRef.message.pipe(take(1));
}
