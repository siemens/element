/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';
import { addIcons, elementCancel, SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-input-pill',
  imports: [SiIconComponent],
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
  /** @internal */
  protected readonly icons = addIcons({ elementCancel });
}
