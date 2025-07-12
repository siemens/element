/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';
import { addIcons, elementCancel, SiIconNextComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-input-pill',
  imports: [SiIconNextComponent],
  templateUrl: './si-input-pill.component.html',
  host: {
    class: 'pill pe-0',
    '[class.pe-4]': 'hideClose()'
  }
})
export class SiInputPillComponent {
  readonly deletePill = output<void>();

  /** @defaultValue false */
  readonly hideClose = input(false);

  protected readonly icons = addIcons({ elementCancel });
}
