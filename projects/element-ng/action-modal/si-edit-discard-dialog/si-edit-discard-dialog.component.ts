/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

import { EditDiscardDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-edit-discard-dialog',
  imports: [AsyncPipe, SiIconComponent, SiTranslatePipe, SiLoadingButtonComponent],
  templateUrl: './si-edit-discard-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiEditDiscardDialogComponent {
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
   * Label displayed on the save button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`)
   * ```
   */
  readonly saveBtnName = input(t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.SAVE_BTN:Save`));
  /**
   * Label displayed on the discard button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Discard`)
   * ```
   */
  readonly discardBtnName = input(
    t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISCARD_BTN:Discard`)
  );
  /**
   * Label displayed on the cancel button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`)
   * ```
   */
  readonly cancelBtnName = input(t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.CANCEL_BTN:Cancel`));
  /**
   * Whether the save button is disabled.
   * @defaultValue false
   */
  readonly disableSave = input(false, { transform: booleanAttribute });
  /**
   * Message displayed when saving is disabled.
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
   * Label displayed on the discard button when saving is disabled.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`)
   * ```
   */
  readonly disableSaveDiscardBtnName = input<TranslatableString>(
    t(() => $localize`:@@SI_EDIT_DISCARD_DIALOG.DISABLE_SAVE_DISCARD_BTN:Discard`)
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

  protected modalRef = inject(ModalRef<SiEditDiscardDialogComponent, EditDiscardDialogResult>);
  protected loading$ = this.modalRef.message.pipe(take(1));
  protected readonly icons = addIcons({ elementCancel });
}
