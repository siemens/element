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
  input,
  signal,
  TemplateRef
} from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/common';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiTooltipContent } from './si-tooltip.model';

@Component({
  selector: 'si-tooltip',
  imports: [NgTemplateOutlet, SiTranslatePipe, NgComponentOutlet],
  templateUrl: './si-tooltip.component.html',
  styleUrl: './si-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'animate.leave': 'tooltip-leave'
  }
})
export class TooltipComponent {
  readonly id = input<string>();

  readonly tooltip = input<SiTooltipContent>();

  readonly tooltipContext = input<unknown>();

  protected readonly tooltipPositionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);

  private readonly elementRef = inject(ElementRef);
  private readonly overlayRef = inject(OverlayRef);

  private lastPositionChange?: ConnectedOverlayPositionChange;
  private lastAnchor?: ElementRef;

  constructor() {
    let isFirstRun = true;
    afterRenderEffect(() => {
      this.tooltip();
      this.tooltipContext();
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
    const tooltip = this.tooltip();
    if (typeof tooltip === 'string') {
      return tooltip;
    }
    // When an ElementRef is provided, read its current text content whenever the
    // tooltip is shown, so dynamic content is always reflected.
    // The tooltip content is not updated while being displayed.
    if (tooltip instanceof ElementRef) {
      return tooltip.nativeElement.textContent.trim();
    }
    return null;
  });

  protected readonly tooltipTemplate = computed<TemplateRef<any> | null>(() => {
    const tooltip = this.tooltip();
    return tooltip instanceof TemplateRef ? tooltip : null;
  });

  protected readonly tooltipComponent = computed(() => {
    const tooltip = this.tooltip();
    return !(tooltip instanceof TemplateRef) &&
      !(tooltip instanceof ElementRef) &&
      typeof tooltip !== 'string'
      ? tooltip
      : null;
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
