import { Component, inject, Input } from '@angular/core';
import { ModalRef, SiModalService  } from '@siemens/element-ng/modal';

@Component({
  selector: 'modal-content',
  template: 'modal',
  standalone: true,
})
export class ModalContent {
  @Input()
  protected fileFormat = ''
}

export class MyClass {
  private readonly modalService = inject(SiModalService);
  private modalRef: ModalRef<ModalContent>;

  myMethod() {
    this.modalRef = this.modalService.show(ModalContent, {
      class: 'modal-dialog-centered',
      initialState: { fileFormat: 'pdf' },
      ignoreBackdropClick: false,
    });
  }
}
