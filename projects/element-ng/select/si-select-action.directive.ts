/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Directive, HostListener, inject, input } from '@angular/core';

import { SiSelectComponent } from './si-select.component';

@Directive({
  selector: '[siSelectAction]',
  exportAs: 'si-select-action',
  host: {
    class: 'mx-5 my-4'
  }
})
export class SiSelectActionDirective {
  private readonly select = inject(SiSelectComponent);
  /**
   * Close the select drop down on click.
   * @defaultValue false
   */
  readonly selectActionAutoClose = input(false, { transform: booleanAttribute });

  @HostListener('click')
  protected close(): void {
    if (this.selectActionAutoClose()) {
      this.select.close();
    }
  }
}
