/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
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
    '[attr.aria-describedby]': 'describedBy',
    '(focus)': 'focusIn()',
    '(mouseenter)': 'show()',
    '(touchstart)': 'hide()',
    '(focusout)': 'hide()',
    '(mouseleave)': 'hide()'
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
  private showTimeout?: ReturnType<typeof setTimeout>;
  private tooltipService = inject(SiTooltipService);
  protected elementRef = inject(ElementRef);

  ngOnDestroy(): void {
    this.clearShowTimeout();
    this.tooltipRef?.destroy();
  }

  private clearShowTimeout(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
  }

  protected showTooltipWithContent(
    content: TranslatableString | TemplateRef<any>,
    immediate = false
  ): void {
    if (this.isDisabled() || !content) {
      return;
    }

    this.clearShowTimeout();

    const delay = immediate ? 0 : 500;

    this.showTimeout = setTimeout(() => {
      this.tooltipRef ??= this.tooltipService.createTooltip({
        describedBy: this.describedBy,
        element: this.elementRef,
        placement: this.placement()
      });
      this.tooltipRef.show(content, this.tooltipContext());
    }, delay);
  }

  private showTooltip(immediate = false): void {
    this.showTooltipWithContent(this.siTooltip(), immediate);
  }

  protected focusIn(): void {
    this.showTooltip(true);
  }

  protected show(): void {
    this.showTooltip(false);
  }

  protected hide(): void {
    this.clearShowTimeout();
    this.tooltipRef?.hide();
  }
}
