/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { SiIconModule } from '@siemens/element-ng/icon';
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiIconModule],
  templateUrl: './si-modal-service.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnDestroy {
  private ref?: ModalRef<unknown>;
  private parentRef?: ModalRef<unknown>;

  private logEvent = inject(LOG_EVENT);
  private modalService = inject(SiModalService);

  ngOnDestroy(): void {
    this.ref?.detach();
    this.parentRef?.detach();
  }

  openModal(template: TemplateRef<any>, modalClass?: string): void {
    this.ref?.hide();
    this.ref = this.modalService.show(
      template,
      {
        ignoreBackdropClick: false,
        keyboard: true,
        animated: true,
        class: modalClass,
        ariaLabelledBy: 'sample-modal-title'
      },
      'cancel'
    );
    this.ref.hidden.subscribe(closeValue => this.logEvent('Modal closed with value', closeValue));
  }

  openParentModal(template: TemplateRef<any>, modalClass?: string): void {
    this.parentRef?.hide();
    this.parentRef = this.modalService.show(
      template,
      {
        initialState: { someThing: 'some context' },
        ignoreBackdropClick: false,
        keyboard: true,
        animated: true,
        class: modalClass,
        ariaLabelledBy: 'sample-modal-title-parent'
      },
      'cancel'
    );
    this.parentRef.hidden.subscribe(closeValue =>
      this.logEvent('Parent modal closed with value', closeValue)
    );
  }
}
