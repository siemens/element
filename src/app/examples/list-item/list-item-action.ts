/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { elementUser, elementLock } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent],
  templateUrl: './list-item-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-4' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  icons = addIcons({ elementUser, elementLock });
}
