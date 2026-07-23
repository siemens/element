/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { SiDatatableModule } from '../si-datatable';
import { SiModalModule } from '../si-modal';
import { SiSearchBarModule } from '../si-search-bar';
import { SiEntitySelectionDialogService } from './si-entity-selection-dialog.service';
import { SiEntitySelectionDialogComponent } from './si-entity-selection-dialog/si-entity-selection-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    SiDatatableModule,
    SiModalModule,
    SiSearchBarModule,
    TranslateModule
  ],
  declarations: [SiEntitySelectionDialogComponent],
  providers: [SiEntitySelectionDialogService],
  exports: []
})
export class SiEntitySelectionDialogModule {}
