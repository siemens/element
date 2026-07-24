/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, inject } from '@angular/core';

import { SiTooltipService } from './si-tooltip.service';

/**
 * Adds a tooltip containing the host element's text when that text is truncated.
 */
@Directive({
  selector: '[siTooltipOverflow]',
  providers: [SiTooltipService],
  host: {
    class: 'text-truncate'
  }
})
export class SiTooltipOverflowDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tooltipService = inject(SiTooltipService);
  private readonly element = this.elementRef.nativeElement;

  constructor() {
    this.tooltipService.createTooltip({
      element: this.elementRef,
      placement: () => 'auto',
      /*
       * `canShow` is evaluated everytime before the tooltip is eventually rendered.
       * So there is no need for any listener.
       * It also updates the `tooltipText`.
       */
      canShow: () => this.canShow(),
      tooltip: () => this.elementRef,
      tooltipContext: () => undefined
    });
  }

  private canShow(): boolean {
    return (
      this.element.scrollWidth > this.element.clientWidth ||
      this.element.scrollHeight > this.element.clientHeight
    );
  }
}
