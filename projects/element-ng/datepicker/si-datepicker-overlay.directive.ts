/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getOverlayPositions, isRTL, positions } from '@spike-rabbit/element-ng/common';
import { BOOTSTRAP_BREAKPOINTS } from '@spike-rabbit/element-ng/resize-observer';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, skip, takeUntil, tap } from 'rxjs/operators';

import { SiDatepickerOverlayComponent } from './si-datepicker-overlay.component';
import { DatepickerConfig, DateRange } from './si-datepicker.model';

// eslint-disable-next-line no-restricted-syntax
export enum CloseCause {
  Backdrop = 'backdrop',
  Detach = 'detach',
  Escape = 'escape',
  Select = 'select'
}

export type DatepickerInput = {
  config: DatepickerConfig;
  date: Date;
  dateRange: DateRange;
  rangeType: 'START' | 'END';
  time12h: boolean;
  showTime: true;
};

/** Partial datepicker inputs */
export type DatepickerInputPartial = Partial<DatepickerInput>;

/**
 * Directive with the responsibility to open/close datepicker overlay.
 */
@Directive({
  selector: '[siDatepickerOverlay]',
  exportAs: 'siDatepickerOverlay'
})
export class SiDatepickerOverlayDirective implements OnDestroy {
  /**
   * Position of the datepicker overlay. Accepts an array of positions or a single position.
   * The position will be chosen based on the first position that fits into the viewport.
   * The input is necessary since the positions between the siDatepicker directive and si-date-range
   * component are different.
   * @internal
   */
  readonly placement = signal<keyof typeof positions | ConnectionPositionPair[]>([
    {
      overlayX: 'start',
      overlayY: 'top',
      originX: 'start',
      originY: 'bottom'
    },
    {
      overlayX: 'start',
      overlayY: 'bottom',
      originX: 'start',
      originY: 'top'
    }
  ]);
  /**
   * Output event on closing datepicker e.g. by clicking backdrop or escape key.
   */
  readonly siDatepickerClose = output<CloseCause>();

  private overlayRef?: OverlayRef;
  private datepickerRef?: ComponentRef<SiDatepickerOverlayComponent>;
  private autoCloseSelection = new Subject<void>();
  /** Guard for siDatepickerClose event emitter to make sure the cause is emitter just once */
  private ignoreClose = false;
  private readonly overlay = inject(Overlay);
  private readonly triggerElementRef = inject(ElementRef);
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  /**
   * When the media query matches on open the overlay is displayed like a modal dialog.
   * In case, users change the screen size to the matching media query we close the overlay
   * if it is open with a connected overlay strategy.
   */
  private readonly smallScreenQuery = `(max-width: ${BOOTSTRAP_BREAKPOINTS.mdMinimum}px) or (max-height: ${BOOTSTRAP_BREAKPOINTS.smMinimum}px)`;

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.datepickerRef = undefined;
  }

  /**
   * Show datepicker overlay.
   * @param focus - move focus to the datepicker.
   * @returns create datepicker overlay instance
   */
  showOverlay(
    focus = false,
    inputs?: DatepickerInputPartial
  ): ComponentRef<SiDatepickerOverlayComponent> {
    return this.showDatepicker().setInputs(inputs).focus(focus).datepickerRef!;
  }

  /**
   * Close datepicker.
   */
  closeOverlay(): undefined {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef?.detach();
      this.overlayRef?.dispose();
    }
    this.datepickerRef = undefined;
    return undefined;
  }

  /**
   * Focus active cell in datepicker.
   * @param focus - show transfer focus.
   * @returns current instance.
   */
  focus(focus = true): this {
    if (focus) {
      this.datepickerRef?.setInput('initialFocus', true);
      this.datepickerRef?.instance.focusActiveCell();
      this.datepickerRef?.changeDetectorRef.markForCheck();
    }
    return this;
  }

  /**
   * Indicate the datepicker is visible.
   * @returns is visible.
   */
  isShown(): ComponentRef<SiDatepickerOverlayComponent> | undefined {
    return this.datepickerRef;
  }

  /** Set datepicker inputs */
  setInputs(inputs?: DatepickerInputPartial): this {
    if (this.datepickerRef && inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        this.datepickerRef!.setInput(key.toString(), value);
      });
    }
    return this;
  }

  /** Close overlay with cause select, which will recover the focus */
  closeAfterSelection(): void {
    this.autoCloseSelection.next();
  }

  /** Indicate whether the HTML element is a child of the datepicker overlay. */
  contains(element: HTMLElement): boolean {
    if (!element) {
      return false;
    }
    return this.overlayRef?.overlayElement?.contains(element) ?? false;
  }

  private showDatepicker(): this {
    if (this.overlayRef?.hasAttached()) {
      return this;
    }

    // Since the connected overlay strategy has some limitations in small screens e.g.
    // the overlay is moved via style top without recalculating the (max)height which
    // can result in a cut of time picker.
    // To overcome this issue the overlay use the global position strategy in small screens.
    const smallScreen = this.mediaMatcher.matchMedia(this.smallScreenQuery).matches;
    if (smallScreen) {
      this.createMobileOverlay();
    } else {
      this.createDesktopOverlay();
    }

    this.closeStream(this.overlayRef!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(outputToObservable(this.siDatepickerClose))
      )
      .subscribe(cause => {
        // The handler is called multiple times since we need to listen to detach events
        if (this.datepickerRef && !this.ignoreClose) {
          this.ignoreClose = true;
          this.closeOverlay();
          this.ignoreClose = false;
          this.siDatepickerClose.emit(cause);
        }
      });

    const portal = new ComponentPortal(SiDatepickerOverlayComponent);
    this.datepickerRef = this.overlayRef!.attach(portal);
    if (smallScreen) {
      this.datepickerRef.setInput('isMobile', true);
    }

    // Automatically close the overlay if we reach the small screen breakpoint
    // and the picker does not use the global position strategy.
    this.breakpointObserver
      .observe(this.smallScreenQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(outputToObservable(this.siDatepickerClose)),
        skip(1)
      )
      .subscribe(() => this.closeOverlay());
    return this;
  }

  protected createMobileOverlay(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      direction: isRTL() ? 'rtl' : 'ltr',
      hasBackdrop: true,
      backdropClass: 'modal-backdrop'
    });
  }

  protected createDesktopOverlay(): void {
    const popoverPositions = getOverlayPositions(this.triggerElementRef, this.placement(), false);
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerElementRef)
        .withPositions(popoverPositions)
        .withPush(true)
        .withGrowAfterOpen(true)
        .withFlexibleDimensions(true)
        .withViewportMargin(4),
      direction: isRTL() ? 'rtl' : 'ltr',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }
  /**
   * Merge events which shall close the overlay
   * @param overlayRef - source for backdrop, detach or escape events.
   * @returns merged observable
   */
  private closeStream(overlayRef: OverlayRef): Observable<CloseCause> {
    return merge(
      this.autoCloseSelection.pipe(map(() => CloseCause.Select)),
      overlayRef.backdropClick().pipe(map(() => CloseCause.Backdrop)),
      overlayRef.detachments().pipe(map(() => CloseCause.Detach)),
      overlayRef.keydownEvents().pipe(
        filter(event => event.key === 'Escape'),
        tap(event => event.stopPropagation()), // ESC handled, prevent closing modal, etc.
        map(() => CloseCause.Escape)
      )
    );
  }
}
