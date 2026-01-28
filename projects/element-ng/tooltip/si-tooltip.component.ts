/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  Type
} from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/common';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import type { TooltipRef } from './si-tooltip.service';

@Component({
  selector: 'si-tooltip',
  imports: [NgTemplateOutlet, SiTranslatePipe, NgComponentOutlet],
  templateUrl: './si-tooltip.component.html'
})
export class TooltipComponent {
  /** @defaultValue '' */
  readonly tooltip = input<TranslatableString | TemplateRef<any> | Type<any>>('');

  /** @internal */
  tooltipRef?: TooltipRef;

  protected readonly tooltipPositionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);
  protected readonly isVisible = signal(true);
  /** @defaultValue true */
  readonly isOpening = signal(true);
  /** @internal */
  readonly id = input('');
  readonly tooltipContext = input();

  private elementRef = inject(ElementRef);

  protected readonly tooltipText = computed<string | null>(() => {
    const tooltip = this.tooltip();
    return typeof tooltip === 'string' ? tooltip : null;
  });

  protected readonly tooltipTemplate = computed<TemplateRef<any> | null>(() => {
    const tooltip = this.tooltip();
    return tooltip instanceof TemplateRef ? tooltip : null;
  });

  protected readonly tooltipComponent = computed(() => {
    const tooltip = this.tooltip();
    return !(tooltip instanceof TemplateRef) && typeof tooltip !== 'string' ? tooltip : null;
  });

  /** @internal */
  updateTooltipPosition(change: ConnectedOverlayPositionChange, anchor?: ElementRef): void {
    const arrowClassTooltip = `tooltip-${change.connectionPair.overlayX}-${change.connectionPair.overlayY}`;
    // need two updates as class changes affect the position
    if (arrowClassTooltip !== this.tooltipPositionClass()) {
      this.tooltipPositionClass.set(arrowClassTooltip);
    }
    const arrowPos = calculateOverlayArrowPosition(change, this.elementRef, anchor);
    this.arrowPos.set(arrowPos);
  }

  /** @internal */
  hide(): void {
    this.isVisible.set(false);
  }

  /** @internal */
  onAnimationend(event: AnimationEvent): void {
    if (event.animationName === 'tooltip-enter' && this.isVisible()) {
      this.isOpening.set(false);
    }
  }

  /** @internal */
  onAnimationstart(event: AnimationEvent): void {
    if (event.animationName === 'tooltip-enter' && this.isVisible()) {
      this.isOpening.set(true);
    }
  }

  /** @internal */
  onTransitionend(event: TransitionEvent): void {
    if (event.propertyName === 'opacity' && !this.isVisible()) {
      this.tooltipRef?.detach();
    }
  }
}
