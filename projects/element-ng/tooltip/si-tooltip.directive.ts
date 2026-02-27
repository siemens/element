/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  TemplateRef
} from '@angular/core';
import { positions } from '@siemens/element-ng/common';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiTooltipService, TooltipRef } from './si-tooltip.service';

@Directive({
  selector: '[siTooltip]',
  providers: [SiTooltipService],
  host: {
    '[attr.aria-describedby]': 'describedBy'
  }
})
export class SiTooltipDirective implements OnDestroy {
  private static idCounter = 0;

  /**
   * The tooltip text to be displayed
   *
   * @defaultValue ''
   */
  readonly siTooltip = input<TranslatableString | TemplateRef<any>>('');

  /**
   * The placement of the tooltip. One of 'top', 'start', end', 'bottom'
   *
   * @defaultValue 'auto'
   */
  readonly placement = input<keyof typeof positions>('auto');

  /**
   * Allows the tooltip to be disabled
   *
   * @defaultValue false
   */
  readonly isDisabled = input(false, { transform: booleanAttribute });

  /**
   * The context for the attached template
   */
  readonly tooltipContext = input();

  protected describedBy = `__tooltip_${SiTooltipDirective.idCounter++}`;

  private tooltipRef?: TooltipRef;
  private tooltipService = inject(SiTooltipService);
  private elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const tooltip = this.siTooltip();
      const disabled = this.isDisabled();

      if (tooltip && !disabled) {
        this.tooltipRef ??= this.tooltipService.createTooltip({
          describedBy: this.describedBy,
          element: this.elementRef,
          placement: this.placement(),
          tooltip: this.siTooltip,
          tooltipContext: this.tooltipContext
        });
      } else if (this.tooltipRef) {
        this.tooltipRef.destroy();
        this.tooltipRef = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.tooltipRef?.destroy();
  }
}
