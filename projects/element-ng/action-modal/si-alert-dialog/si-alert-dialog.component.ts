/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { SiLoadingButtonComponent } from '@spike-rabbit/element-ng/loading-spinner';
import { ModalRef } from '@spike-rabbit/element-ng/modal';
import { SiTranslatePipe, TranslatableString } from '@spike-rabbit/element-translate-ng/translate';
import { take } from 'rxjs';

import { AlertDialogResult } from '../si-action-dialog.types';

@Component({
  selector: 'si-alert-dialog',
  imports: [AsyncPipe, SiIconNextComponent, SiTranslatePipe, SiLoadingButtonComponent],
  templateUrl: './si-alert-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiAlertDialogComponent {
  readonly titleId = input<string>();
  /** @defaultValue '' */
  readonly heading = input<TranslatableString>('');
  /** @defaultValue '' */
  readonly message = input<TranslatableString>('');
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_ALERT_DIALOG.OK:OK`
   * ```
   */
  readonly confirmBtnName = input($localize`:@@SI_ALERT_DIALOG.OK:OK`);
  /**
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly translationParams = input<{ [key: string]: any }>({});
  /** @defaultValue '' */
  readonly icon = input('');

  protected modalRef = inject(ModalRef<SiAlertDialogComponent, AlertDialogResult>);
  protected loading$ = this.modalRef.message.pipe(take(1));
}
