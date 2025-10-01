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
   * The trigger event on which the tooltip shall be displayed
   */
  readonly triggers = input<'' | 'focus'>();

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
  private isTooltipVisible = false;
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
    this.tooltipRef.show(this.siTooltip(), this.tooltipContext());
    this.isTooltipVisible = true;
  }

  @HostListener('click')
  // Ensures dismissible tooltip works on Safari by manually focusing the trigger.
  // See MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#clicking_and_focus
  // See WebKit Bug #22261: https://bugs.webkit.org/show_bug.cgi?id=22261#c68
  protected manuallyFocusTrigger(): void {
    if (!this.isTooltipVisible) {
      this.elementRef.nativeElement.focus();
    }
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
    this.isTooltipVisible = false;
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
