/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, TemplateRef } from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/common';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SI_TOOLTIP_CONFIG } from './si-tooltip.model';

@Component({
  selector: 'si-tooltip',
  imports: [NgTemplateOutlet, SiTranslatePipe, NgComponentOutlet],
  templateUrl: './si-tooltip.component.html',
  styleUrl: './si-tooltip.component.scss',
  host: {
    'animate.leave': 'tooltip-leave'
  }
})
export class TooltipComponent {
  protected readonly tooltipPositionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);

  protected readonly config = inject(SI_TOOLTIP_CONFIG);
  private readonly elementRef = inject(ElementRef);

  protected readonly tooltipText = computed<string | null>(() => {
    const tooltip = this.config.tooltip();
    return typeof tooltip === 'string' ? tooltip : null;
  });

  protected readonly tooltipTemplate = computed<TemplateRef<any> | null>(() => {
    const tooltip = this.config.tooltip();
    return tooltip instanceof TemplateRef ? tooltip : null;
  });

  protected readonly tooltipComponent = computed(() => {
    const tooltip = this.config.tooltip();
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
}
