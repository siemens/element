/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

import { SiSelectComponent } from './si-select.component';

@Directive({
  selector: '[siSelectAction]',
  host: {
    class: 'mx-5 my-4',
    '(click)': 'close()',
    '(focusout)': 'focusout($event)'
  },
  exportAs: 'si-select-action'
})
export class SiSelectActionDirective {
  private readonly select = inject(SiSelectComponent);
  private readonly elementRef = inject(ElementRef);
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

  protected focusout(event: FocusEvent): void {
    // angular aria combobox will close the overlay on focusout which can happen if
    // action is disabled after click, so we need to prevent the event from propagating
    // if the select is disabled and auto close is false
    if (
      !this.selectActionAutoClose() &&
      !event.relatedTarget &&
      this.elementRef.nativeElement.disabled
    ) {
      event.stopPropagation();
    }
  }
}
