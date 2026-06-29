/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  computed,
  Directive,
  effect,
  EffectCleanupRegisterFn,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  Signal,
  SimpleChanges
} from '@angular/core';
import { SiTooltipDirective, SiTooltipService } from '@siemens/element-ng/tooltip';

import { SiHeaderActionItemBase } from './si-header-action-item.base';

/**
 * Base for icon based actions.
 * @internal
 */
@Directive({})
export abstract class SiHeaderActionIconItemBase
  extends SiHeaderActionItemBase
  implements OnChanges, OnInit
{
  /**
   * Adds a badge to the header item.
   * If type
   * - =number, the number will be shown and automatically trimmed if \>99
   * - =true, an empty red dot will be shown
   */
  readonly badge = input<number | boolean | undefined | null>();

  protected abstract readonly itemTitle: Signal<string | ElementRef<Element>>;

  private readonly tooltipService = inject(SiTooltipService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly existingTooltip = inject(SiTooltipDirective, { optional: true, host: true });

  protected readonly badgeDot = computed(() =>
    typeof this.badge() === 'boolean' ? (this.badge() as boolean) : false
  );
  protected readonly badgeValue = computed(() => {
    const badge = this.badge();
    return typeof badge === 'number'
      ? `${badge > 99 ? '+' : ''}${Math.min(99, Math.round(badge))}`
      : undefined;
  });

  constructor() {
    super();
    effect(onCleanup => this.setupTooltip(onCleanup));
  }

  private setupTooltip(onCleanup: EffectCleanupRegisterFn): void {
    const hasActiveTooltip =
      !!this.existingTooltip &&
      !this.existingTooltip.isDisabled() &&
      !!this.existingTooltip.siTooltip();
    if (this.visuallyHideTitle() && !hasActiveTooltip) {
      const tooltipRef = this.tooltipService.createTooltip({
        element: this.elementRef,
        placement: 'auto',
        tooltip: this.itemTitle,
        tooltipContext: () => undefined
      });
      onCleanup(() => tooltipRef.destroy());
    }
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.badge) {
      if (changes.badge.currentValue && !changes.badge.previousValue) {
        this.collapsibleActions?.badgeCount.update(count => count + 1);
      } else if (!changes.badge.currentValue && changes.badge.previousValue) {
        this.collapsibleActions?.badgeCount.update(count => count - 1);
      }
    }
  }

  protected readonly visuallyHideTitle = computed(() => !this.collapsibleActions?.mobileExpanded());
}
