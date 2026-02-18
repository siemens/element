/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTabsetComponent, SiTabComponent } from '@siemens/element-ng/tabs';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTooltipDirective, SiTabsetComponent, SiTabComponent],
  templateUrl: './si-tooltip.html'
})
export class SampleComponent {
  readonly focusButton = viewChild.required<ElementRef<HTMLButtonElement>>('focusButton');

  html = `<strong>I'm a microwave</strong>`;

  constructor() {
    afterNextRender(() => {
      const button = this.focusButton();
      button.nativeElement.focus();
    });
  }
}
