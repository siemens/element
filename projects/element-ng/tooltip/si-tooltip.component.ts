/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange, OverlayRef } from '@angular/cdk/overlay';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  TemplateRef
} from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/common';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SI_TOOLTIP_CONFIG } from './si-tooltip.model';

@Component({
  selector: 'si-tooltip',
  imports: [NgTemplateOutlet, SiTranslatePipe, NgComponentOutlet],
  templateUrl: './si-tooltip.component.html',
  styleUrl: './si-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'animate.leave': 'tooltip-leave'
  }
})
export class TooltipComponent {
  protected readonly tooltipPositionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);

  protected readonly config = inject(SI_TOOLTIP_CONFIG);
  private readonly elementRef = inject(ElementRef);
  private readonly overlayRef = inject(OverlayRef);

  private lastPositionChange?: ConnectedOverlayPositionChange;
  private lastAnchor?: ElementRef;

  constructor() {
    let isFirstRun = true;
    afterRenderEffect(() => {
      this.config.tooltip();
      this.config.tooltipContext();
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }
      this.overlayRef.updatePosition();
      if (this.lastPositionChange) {
        this.updateTooltipPosition(this.lastPositionChange, this.lastAnchor);
      }
    });
  }

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
    this.lastPositionChange = change;
    this.lastAnchor = anchor;
    const arrowClassTooltip = `tooltip-${change.connectionPair.overlayX}-${change.connectionPair.overlayY}`;
    // need two updates as class changes affect the position
    if (arrowClassTooltip !== this.tooltipPositionClass()) {
      this.tooltipPositionClass.set(arrowClassTooltip);
    }
    const arrowPos = calculateOverlayArrowPosition(change, this.elementRef, anchor);
    this.arrowPos.set(arrowPos);
  }
}
