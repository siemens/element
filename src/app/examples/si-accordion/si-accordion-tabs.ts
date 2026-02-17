/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT } from '@siemens/live-preview';
import { DatatableComponent } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [
    SiAccordionComponent,
    SiCollapsiblePanelComponent,
    DatatableComponent,
    SiTabComponent,
    SiTabsetComponent,
    SiSearchBarComponent
  ],
  templateUrl: './si-accordion-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
