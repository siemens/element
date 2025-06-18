/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  templateUrl: './bootstrap.html',
  host: { class: 'p-5' },
  imports: [FormsModule, SiFormItemComponent, SiIconComponent]
})
export class SampleComponent {
  useHover = false;
  useSmallTable = false;
}
