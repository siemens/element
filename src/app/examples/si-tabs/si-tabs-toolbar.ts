/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiMenuBarDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiTabComponent, SiTabPortalComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiMenuBarDirective,
    SiMenuItemComponent,
    SiTabComponent,
    SiTabPortalComponent,
    SiTabsetComponent,
    SiTooltipDirective
  ],
  templateUrl: './si-tabs-toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
