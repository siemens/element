/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ScrollStrategy } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  computed,
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
    '[attr.aria-describedby]': 'isDisabled() ? null : describedBy'
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
   * Optional CDK scroll strategy used for the tooltip overlay.
   * If not provided, the default reposition strategy is used.
   */
  readonly tooltipScrollStrategy = input<ScrollStrategy>();

  /**
   * The context for the attached template
   */
  readonly tooltipContext = input();

  protected describedBy = `__tooltip_${SiTooltipDirective.idCounter++}`;

  private readonly canShow = computed(() => !!this.siTooltip() && !this.isDisabled());
  private readonly tooltipService = inject(SiTooltipService);
  private readonly elementRef = inject(ElementRef);
  private readonly tooltipRef: TooltipRef = this.tooltipService.createTooltip({
    describedBy: this.describedBy,
    element: this.elementRef,
    placement: this.placement(),
    canShow: this.canShow,
    tooltip: this.siTooltip,
    tooltipContext: this.tooltipContext,
    scrollStrategy: this.tooltipScrollStrategy
  });

  ngOnDestroy(): void {
    this.tooltipRef.destroy();
  }
}
