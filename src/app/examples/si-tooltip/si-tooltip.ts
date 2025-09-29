/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { afterNextRender, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTabsetComponent, SiTabComponent } from '@siemens/element-ng/tabs';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTooltipDirective, SiTabsetComponent, SiTabComponent],
  templateUrl: './si-tooltip.html'
})
export class SampleComponent implements OnDestroy {
  readonly focusButton = viewChild.required<ElementRef<HTMLButtonElement>>('focusButton');
  private focusTimeout?: ReturnType<typeof setTimeout>;

  html = `<strong>I'm a microwave</strong>`;

  constructor() {
    afterNextRender(() => {
      const button = this.focusButton();
      if (!button) return;

      this.focusTimeout = setTimeout(() => {
        button.nativeElement.focus();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
  }
}
