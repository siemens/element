import { Component } from '@angular/core';
import { SiModalService } from '@siemens/element-ng/modal';
import { MyModalComponent } from './my-modal.component';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `<button (click)="openModal()">Open</button>`
})
export class TestComponent {
  constructor(private modalService: SiModalService) {}

  openModal() {
    this.modalService.show(MyModalComponent, {
      initialState: { title: 'Hello', data: { id: 1 } }
    });
  }

  openModalWithOptions() {
    const modalRef = this.modalService.show(MyModalComponent, {
      initialState: {
        title: 'Edit Item',
        item: { name: 'Test', value: 100 }
      },
      keyboard: false
    });
    return modalRef;
  }

  openModalInline() {
    return this.modalService.show(MyModalComponent, { initialState: { mode: 'create' } });
  }

  openModalMultiline() {
    this.modalService.show(MyModalComponent, {
      initialState: {
        user: { name: 'John', email: 'john@example.com' },
        permissions: ['read', 'write'],
        config: { theme: 'dark' }
      }
    });
  }
}
