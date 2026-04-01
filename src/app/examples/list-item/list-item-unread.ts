/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent],
  templateUrl: './list-item-unread.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  unread = true;
}
