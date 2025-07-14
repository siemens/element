/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { EditDiscardDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-edit-discard-dialog',
  imports: [AsyncPipe, SiIconNextComponent, SiTranslateModule, SiLoadingButtonComponent],
  templateUrl: './si-edit-discard-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiEditDiscardDialogComponent {
  readonly titleId = input<string>();
  /** @defaultValue '' */
  readonly heading = input<TranslatableString>('');
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.MESSAGE:Do you want to save changes to the modified element?`
   * ```
   */
  readonly message = input(
    $localize`:@@SI_EDIT_DISCARD_DIALOG.MESSAGE:Do you want to save changes to the modified element?`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`
   * ```
   */
  readonly saveBtnName = input($localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`);
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Don't save`
   * ```
   */
  readonly discardBtnName = input($localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Don't save`);
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`
   * ```
   */
  readonly cancelBtnName = input($localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`);
  /** @defaultValue false */
  readonly disableSave = input(false, { transform: booleanAttribute });
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_MESSAGE:Do you want to discard the changes`
   * ```
   */
  readonly disableSaveMessage = input<TranslatableString>(
    $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_MESSAGE:Do you want to discard the changes`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`
   * ```
   */
  readonly disableSaveDiscardBtnName = input<TranslatableString>(
    $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`
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

  protected modalRef = inject(ModalRef<SiEditDiscardDialogComponent, EditDiscardDialogResult>);
  protected loading$ = this.modalRef.message.pipe(take(1));
}
