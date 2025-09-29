/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
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
  private showTimeout?: number;
  private tooltipService = inject(SiTooltipService);
  private elementRef = inject(ElementRef);

  ngOnDestroy(): void {
    this.clearShowTimeout();
    this.tooltipRef?.destroy();
  }

  private clearShowTimeout(): void {
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
  }

  private showTooltip(immediate = false): void {
    const siTooltip = this.siTooltip();
    if (this.isDisabled() || !siTooltip) {
      return;
    }

    this.clearShowTimeout();

    const delay = immediate ? 0 : 500;

    this.showTimeout = window.setTimeout(() => {
      this.tooltipRef ??= this.tooltipService.createTooltip({
        describedBy: this.describedBy,
        element: this.elementRef,
        placement: this.placement()
      });
      this.tooltipRef.show(this.siTooltip(), this.tooltipContext());
    }, delay);
  }

  @HostListener('focus')
  protected focusIn(): void {
    this.showTooltip(true);
  }

  @HostListener('mouseenter')
  protected show(): void {
    this.showTooltip(false);
  }

  @HostListener('touchstart')
  @HostListener('focusout')
  @HostListener('mouseleave')
  protected hide(): void {
    this.clearShowTimeout();
    this.tooltipRef?.hide();
  }
}
