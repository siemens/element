/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, Injector } from '@angular/core';
import { SiModalService } from '@siemens/element-ng/modal';

import { DataService } from '../datatable/data.service';
import { AppTableComponent } from './app-table.component';

@Component({
  selector: 'app-sample',
  templateUrl: './si-modal-service-custom.html',
  providers: [DataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  private modalService = inject(SiModalService);
  private injector = inject(Injector);

  openModal(): void {
    this.modalService.show(AppTableComponent, {
      ignoreBackdropClick: false,
      keyboard: true,
      animated: true,
      ariaLabelledBy: 'sample-modal-title',
      injector: this.injector
    });
  }
}
