/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, ElementRef, inject, Injectable, Injector } from '@angular/core';
import { getOverlay, getPositionStrategy, positions } from '@siemens/element-ng/common';
import { fromEvent, Subject, Subscription, timer } from 'rxjs';
import { delayWhen, takeUntil } from 'rxjs/operators';

import { TooltipComponent } from './si-tooltip.component';
import { SI_TOOLTIP_CONFIG, SiTooltipContent } from './si-tooltip.model';

/**
 * TooltipRef is attached to a specific element.
 * Use it to show or hide a tooltip for that element.
 *
 * @internal
 */
class TooltipRef {
  private readonly destroy$ = new Subject<void>();
  private isFocused = false;
  private isHovered = false;

  constructor(
    private overlayRef: OverlayRef,
    private element: ElementRef,
    private injector?: Injector
  ) {
    const nativeElement = this.element.nativeElement;

    fromEvent(nativeElement, 'focus')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.onFocus(event));

    fromEvent(nativeElement, 'mouseenter')
      .pipe(
        takeUntil(this.destroy$),
        delayWhen(() => timer(500).pipe(takeUntil(fromEvent(nativeElement, 'mouseleave'))))
      )
      .subscribe(() => this.onMouseEnter());

    fromEvent(nativeElement, 'focusout')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onFocusOut());

    fromEvent(nativeElement, 'mouseleave')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onMouseLeave());
  }

  private positionSubscription?: Subscription;

  private onFocus(event: unknown): void {
    if (event instanceof FocusEvent && event.target instanceof Element) {
      if ((event.target as Element).matches(':focus-visible')) {
        this.isFocused = true;
        this.show();
      }
    }
  }

  private onFocusOut(): void {
    this.isFocused = false;
    this.hide();
  }

  private onMouseEnter(): void {
    this.isHovered = true;
    this.show();
  }

  private onMouseLeave(): void {
    this.isHovered = false;
    this.hide();
  }

  private show(): void {
    if (this.overlayRef.hasAttached()) {
      return;
    }

    const toolTipPortal = new ComponentPortal(TooltipComponent, undefined, this.injector);
    const tooltipRef: ComponentRef<TooltipComponent> = this.overlayRef.attach(toolTipPortal);

    const positionStrategy = getPositionStrategy(this.overlayRef);
    this.positionSubscription?.unsubscribe();
    this.positionSubscription = positionStrategy?.positionChanges.subscribe(change =>
      tooltipRef.instance.updateTooltipPosition(change, this.element)
    );
  }

  private hide(): void {
    if (this.isFocused || this.isHovered) {
      return;
    }
    this.overlayRef.detach();
    this.positionSubscription?.unsubscribe();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.overlayRef.dispose();
    this.positionSubscription?.unsubscribe();
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
