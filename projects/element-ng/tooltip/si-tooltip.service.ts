/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { ComponentRef, ElementRef, inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { getOverlay, getPositionStrategy, positions } from '@siemens/element-ng/common';
import { fromEvent, Subject, Subscription, timer } from 'rxjs';
import { delayWhen, filter, takeUntil } from 'rxjs/operators';

import { TooltipComponent } from './si-tooltip.component';
import { SI_TOOLTIP_CONFIG, SiTooltipContent } from './si-tooltip.model';

/** @internal */
interface TooltipRef {
  destroy(): void;
}

/**
 * A no-op TooltipRef used on platform server where DOM APIs are unavailable.
 *
 * @internal
 */
class NoopTooltipRef {
  destroy(): void {}
}

/**
 * BrowserTooltipRef is attached to a specific element.
 * Use it to show or hide a tooltip for that element.
 *
 * @internal
 */
class BrowserTooltipRef {
  private readonly destroy$ = new Subject<void>();
  private isFocused = false;
  private isHovered = false;
  private overlayRef?: OverlayRef;
  private positionSubscription?: Subscription;

  constructor(
    private config: {
      describedBy: string;
      element: ElementRef;
      injector?: Injector;
      overlay: Overlay;
      placement: keyof typeof positions;
      scrollStrategy?: () => ScrollStrategy | undefined;
      tooltip: () => SiTooltipContent;
      tooltipContext: () => unknown;
    }
  ) {
    const nativeElement = this.config.element.nativeElement;

    fromEvent(nativeElement, 'focus')
      .pipe(
        filter(event => event instanceof FocusEvent),
        takeUntil(this.destroy$)
      )
      .subscribe(event => this.onFocus(event));

    fromEvent(nativeElement, 'mouseenter')
      .pipe(
        delayWhen(() =>
          // UX Guideline: tooltips on hover should be delayed by 500ms
          timer(500).pipe(
            takeUntil(fromEvent(nativeElement, 'mouseleave')),
            takeUntil(fromEvent(nativeElement, 'focusout')) // user started using keyboard
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.onMouseEnter());

    fromEvent(nativeElement, 'focusout')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onFocusOut());

    fromEvent(nativeElement, 'mouseleave')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onMouseLeave());

    fromEvent(nativeElement, 'touchstart')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onTouchStart());

    // The tooltip may be created lazily, after the element is already focused or
    // hovered (e.g. when validation errors appear on blur while the pointer still
    // hovers the element). In that case the initial `focus`/`mouseenter` was
    // missed, so show the tooltip immediately based on the live `:focus-visible`
    // and `:hover` state.
    if (nativeElement === document.activeElement && nativeElement.matches(':focus-visible')) {
      this.isFocused = true;
      this.show();
    } else if (nativeElement.matches(':hover')) {
      this.onMouseEnter();
    }
  }

  private onFocus(event: FocusEvent): void {
    if (event.target instanceof Element) {
      if (event.target.matches(':focus-visible')) {
        this.isFocused = true;
        this.show();
      }
    }
  }

  private onFocusOut(): void {
    this.isFocused = false;
    this.isHovered = false;
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

  private onTouchStart(): void {
    // On touch devices a tooltip is not useful and would obscure the content the
    // user just tapped. Reset the hover/focus state so it is hidden immediately.
    this.isFocused = false;
    this.isHovered = false;
    this.hide();
  }

  private getOrCreateOverlay(): OverlayRef {
    this.overlayRef ??= getOverlay(
      this.config.element,
      this.config.overlay,
      false,
      this.config.placement,
      false,
      true,
      this.config.scrollStrategy?.()
    );
    return this.overlayRef;
  }

  private show(): void {
    const overlayRef = this.getOrCreateOverlay();
    if (overlayRef.hasAttached()) {
      return;
    }

    const toolTipPortal = new ComponentPortal(TooltipComponent, undefined, this.config.injector);
    const tooltipRef: ComponentRef<TooltipComponent> = overlayRef.attach(toolTipPortal);

    const positionStrategy = getPositionStrategy(overlayRef);
    this.positionSubscription?.unsubscribe();
    this.positionSubscription = positionStrategy?.positionChanges.subscribe(change =>
      tooltipRef.instance.updateTooltipPosition(change, this.config.element)
    );
  }

  private hide(): void {
    if (this.isFocused || this.isHovered) {
      return;
    }
    this.overlayRef?.detach();
    this.positionSubscription?.unsubscribe();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.overlayRef?.dispose();
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
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  createTooltip(config: {
    describedBy: string;
    element: ElementRef;
    placement: keyof typeof positions;
    injector?: Injector;
    tooltip: () => SiTooltipContent;
    tooltipContext: () => unknown;
    scrollStrategy?: () => ScrollStrategy | undefined;
  }): TooltipRef {
    if (!this.isBrowser) {
      return new NoopTooltipRef();
    }

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

    return new BrowserTooltipRef({
      ...config,
      injector,
      overlay: this.overlay
    });
  }
}

export type { TooltipRef };
