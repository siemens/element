/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { elementLink, elementSettings } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTabsetComponent, SiTabComponent, ReactiveFormsModule],
  templateUrl: './si-tabs-toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected selectedTabIndex = 0;
  protected readonly formControl = inject(FormBuilder).control('');
  protected readonly icons = addIcons({ elementLink, elementSettings });
}
