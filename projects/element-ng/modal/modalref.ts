/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ElementRef } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

import { ModalOptions } from './si-modal.service';

/**
 * Reference to a modal dialog
 * @typeParam T - the type of the content
 * @typeParam CT - the close type
 */
export class ModalRef<T = never, CT = any> {
  /** Emits the close value when the modal is hidden. */
  hidden = new Subject<CT | undefined>();
  /** Allows messaging state to consumer w/o closing the dialog. */
  message = new Subject<CT | undefined>();
  /** Emits the modal element reference when it is shown. */
  shown = new ReplaySubject<ElementRef>(1);
  /**
   * The modal options passed during creation.
   *
   * @defaultValue `{}`
   * @see {@link SiModalService}
   */
  data: ModalOptions = {};
  /** @defaultValue true */
  ignoreBackdropClick = true;
  /**
   * Custom class for modal-dialog
   *
   * @defaultValue ''
   */
  dialogClass = '';
  /**
   * The layer of the modal. The modal with the highest layer will be shown on top.
   *
   * @defaultValue 0
   */
  layer = 0;
  /** The default close value of the modal. */
  closeValue?: CT;

  get content(): T {
    return undefined as unknown as T;
  }

  /** Set the input of a component shown in the modal. */
  setInput(input: string, value: unknown): void {}

  /**
   * @defaultValue `() => false`
   */
  isCurrent: () => boolean = () => false;
  /**
   * @defaultValue `() => {}`
   */
  detach: () => void = () => {};
  /**
   * Close the modal with a custom close value.
   *
   * @defaultValue `() => {}`
   */
  hide: (reason?: CT) => void = () => {};

  /**
   * When `data.disableAutoHide` is set, messages the `reason`, otherwise calls {@link hide}.
   */
  messageOrHide(reason?: CT): void {
    if (this.data.messageInsteadOfAutoHide) {
      this.message.next(reason);
    } else {
      this.hide(reason);
    }
  }
}
