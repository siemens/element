/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { EditDiscardDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-edit-discard-dialog',
  imports: [AsyncPipe, SiIconNextComponent, SiTranslatePipe, SiLoadingButtonComponent],
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
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.MESSAGE:Do you want to save changes to the modified element?`)
   * ```
   */
  readonly message = input(
    t(
      () =>
        $localize`:@@SI_EDIT_DISCARD_DIALOG.MESSAGE:Do you want to save changes to the modified element?`
    )
  );
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`)
   * ```
   */
  readonly saveBtnName = input(t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`));
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Don't save`)
   * ```
   */
  readonly discardBtnName = input(
    t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Don't save`)
  );
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`)
   * ```
   */
  readonly cancelBtnName = input(t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`));
  /** @defaultValue false */
  readonly disableSave = input(false, { transform: booleanAttribute });
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_MESSAGE:Do you want to discard the changes`)
   * ```
   */
  readonly disableSaveMessage = input<TranslatableString>(
    t(
      () =>
        $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_MESSAGE:Do you want to discard the changes`
    )
  );
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`)
   * ```
   */
  readonly disableSaveDiscardBtnName = input<TranslatableString>(
    t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`)
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
