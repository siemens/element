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
import { Subject } from 'rxjs';

import { SiTooltipService, TooltipRef } from './si-tooltip.service';

@Directive({
  selector: '[siTooltip]',
  host: {
    '[attr.aria-describedby]': 'describedBy'
  },
  providers: [SiTooltipService]
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
   * The trigger event on which the tooltip shall be displayed
   */
  readonly triggers = input<'' | 'focus'>();

  /**
   * Allows the tooltip to be disabled
   *
   * @defaultValue false
   */
  readonly isDisabled = input(false, { transform: booleanAttribute });

  protected describedBy = `__tooltip_${SiTooltipDirective.idCounter++}`;

  private tooltipRef?: TooltipRef;
  private tooltipService = inject(SiTooltipService);
  private elementRef = inject(ElementRef);
  private destroyer = new Subject<void>();

  ngOnDestroy(): void {
    this.tooltipRef?.destroy();
    this.destroyer.next();
    this.destroyer.complete();
  }

  private showTooltip(): void {
    const siTooltip = this.siTooltip();
    if (this.isDisabled() || !siTooltip) {
      return;
    }
    this.tooltipRef ??= this.tooltipService.createTooltip({
      describedBy: this.describedBy,
      element: this.elementRef,
      placement: this.placement()
    });
    this.tooltipRef.show(this.siTooltip());
  }

  @HostListener('focus')
  protected focusIn(): void {
    this.showTooltip();
  }

  @HostListener('mouseenter')
  protected show(): void {
    if (this.triggers() === 'focus') {
      return;
    }
    this.showTooltip();
  }

  @HostListener('touchstart')
  @HostListener('focusout')
  protected hide(): void {
    this.tooltipRef?.hide();
    this.destroyer.next();
  }

  @HostListener('mouseleave')
  protected mouseOut(): void {
    if (this.triggers() === 'focus') {
      return;
    }
    this.hide();
  }
}
