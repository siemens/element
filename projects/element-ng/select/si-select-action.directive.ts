/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Directive, inject, input } from '@angular/core';

import { SiSelectComponent } from './si-select.component';

@Directive({
  selector: '[siSelectAction]',
  host: {
    class: 'mx-5 my-4',
    '(click)': 'close()'
  },
  exportAs: 'si-select-action'
})
export class SiSelectActionDirective {
  private readonly select = inject(SiSelectComponent);
  /**
   * Close the select drop down on click.
   * @defaultValue false
   */
  readonly selectActionAutoClose = input(false, { transform: booleanAttribute });

  protected close(): void {
    if (this.selectActionAutoClose()) {
      this.select.close();
    }
  }
}
