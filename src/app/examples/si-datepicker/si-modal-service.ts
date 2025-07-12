/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiDatepickerDirective, SiCalendarButtonComponent } from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiDatepickerDirective, SiCalendarButtonComponent, SiFormItemComponent],
  templateUrl: './si-modal-service.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnDestroy {
  private ref?: ModalRef<unknown>;

  private modalService = inject(SiModalService);
  protected date = new Date('2022-03-12');

  ngOnDestroy(): void {
    this.ref?.detach();
  }

  openModal(template: TemplateRef<any>, modalClass?: string): void {
    this.ref?.hide();
    this.ref = this.modalService.show(template, {
      ignoreBackdropClick: false,
      keyboard: true,
      animated: true,
      class: modalClass,
      ariaLabelledBy: 'sample-modal-title'
    });
  }
}
