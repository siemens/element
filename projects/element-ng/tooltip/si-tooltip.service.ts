/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, ElementRef, inject, Injectable, Injector } from '@angular/core';
import { getOverlay, getPositionStrategy, positions } from '@siemens/element-ng/common';
import { Subscription } from 'rxjs';

import { TooltipComponent } from './si-tooltip.component';
import { SI_TOOLTIP_CONFIG, SiTooltipContent } from './si-tooltip.model';

/**
 * TooltipRef is attached to a specific element.
 * Use it to show or hide a tooltip for that element.
 *
 * @internal
 */
class TooltipRef {
  constructor(
    private overlayRef: OverlayRef,
    private element: ElementRef,
    private injector?: Injector
  ) {}

  private subscription?: Subscription;

  show(): void {
    if (this.overlayRef.hasAttached()) {
      return;
    }

    const toolTipPortal = new ComponentPortal(TooltipComponent, undefined, this.injector);
    const tooltipRef: ComponentRef<TooltipComponent> = this.overlayRef.attach(toolTipPortal);

    const positionStrategy = getPositionStrategy(this.overlayRef);
    this.subscription?.unsubscribe();
    this.subscription = positionStrategy?.positionChanges.subscribe(change =>
      tooltipRef.instance.updateTooltipPosition(change, this.element)
    );
  }

  hide(): void {
    this.overlayRef.detach();
    this.subscription?.unsubscribe();
  }

  destroy(): void {
    this.overlayRef.dispose();
    this.subscription?.unsubscribe();
  }
}

/**
 * A service to create tooltips for specific elements.
 * Use this if the tooltip directive is not suitable.
 * Must not be used outside element-ng.
 *
 * @internal
 */
// We cannot provide this in root, as people may override the cdk overlay creation.
@Injectable()
export class SiTooltipService {
  private overlay = inject(Overlay);

  createTooltip(config: {
    describedBy: string;
    element: ElementRef;
    placement: keyof typeof positions;
    injector?: Injector;
    tooltip: () => SiTooltipContent;
    tooltipContext: () => unknown;
  }): TooltipRef {
    const injector = Injector.create({
      parent: config.injector,
      providers: [
        {
          provide: SI_TOOLTIP_CONFIG,
          useValue: {
            id: config.describedBy,
            tooltip: config.tooltip,
            tooltipContext: config.tooltipContext
          }
        }
      ]
    });

    return new TooltipRef(
      getOverlay(config.element, this.overlay, false, config.placement),
      config.element,
      injector
    );
  }
}

export type { TooltipRef };
