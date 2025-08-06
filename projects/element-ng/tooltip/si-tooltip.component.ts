/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
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
import {
  calculateOverlayArrowPosition,
  OverlayArrowPosition
} from '@spike-rabbit/element-ng/common';
import { SiTranslatePipe, TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

@Component({
  selector: 'si-tooltip',
  imports: [NgClass, NgTemplateOutlet, SiTranslatePipe, NgComponentOutlet],
  templateUrl: './si-tooltip.component.html'
})
export class TooltipComponent {
  /** @defaultValue '' */
  readonly tooltip = input<TranslatableString | TemplateRef<any> | Type<any>>('');

  protected readonly tooltipPositionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);
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
}
