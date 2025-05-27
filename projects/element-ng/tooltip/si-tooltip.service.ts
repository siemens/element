/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  ElementRef,
  inject,
  Injectable,
  Injector,
  TemplateRef,
  Type
} from '@angular/core';
import { getOverlay, getPositionStrategy, positions } from '@siemens/element-ng/common';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { TooltipComponent } from './si-tooltip.component';

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
    private describedBy: string,
    private injector?: Injector
  ) {}

  show(content: TranslatableString | TemplateRef<any> | Type<any>): void {
    if (this.overlayRef.hasAttached()) {
      return;
    }

    const toolTipPortal = new ComponentPortal(TooltipComponent, undefined, this.injector);
    const tooltipRef: ComponentRef<TooltipComponent> = this.overlayRef.attach(toolTipPortal);

    tooltipRef.setInput('tooltip', content);
    tooltipRef.setInput('id', this.describedBy);

    const positionStrategy = getPositionStrategy(this.overlayRef);
    positionStrategy?.positionChanges.subscribe(change =>
      tooltipRef.instance.updateTooltipPosition(change, this.element)
    );
  }

  hide(): void {
    this.overlayRef.detach();
  }

  destroy(): void {
    this.overlayRef.dispose();
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
  }): TooltipRef {
    return new TooltipRef(
      getOverlay(config.element, this.overlay, false, config.placement),
      config.element,
      config.describedBy,
      config.injector
    );
  }
}

export type { TooltipRef };
