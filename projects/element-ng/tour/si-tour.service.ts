/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayOutsideClickDispatcher,
  OverlayRef,
  PositionStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ElementRef, inject, Injectable, Injector, signal, DOCUMENT } from '@angular/core';
import { makeOverlay, makePositionStrategy } from '@spike-rabbit/element-ng/common';
import { ResizeObserverService } from '@spike-rabbit/element-ng/resize-observer';
import { map, merge, Subject, Subscription, tap, throttleTime } from 'rxjs';

import { SiTourHighlightComponent } from './si-tour-highlight.component';
import { SI_TOUR_TOKEN, TourAction, TourToken } from './si-tour-token.model';
import { SiTourComponent } from './si-tour.component';
import { TourOptions, TourStep } from './si-tour.model';

@Injectable({ providedIn: 'root' })
export class SiTourService {
  private injector = inject(Injector);
  private resizeObserver = inject(ResizeObserverService);
  private overlay = inject(Overlay);
  private outsideClickDispatcher = inject(OverlayOutsideClickDispatcher);
  private overlayRefHighlight?: OverlayRef;
  private overlayRef?: OverlayRef;
  private portal?: ComponentPortal<SiTourComponent>;

  private options: TourOptions = {};
  private steps: TourStep[] = [];
  private currentStepIndex = -1;
  private currentStep?: TourStep;
  private active = false;
  private tourToken: TourToken = {
    currentStep: new Subject(),
    blocked: signal(false),
    positionChange: new Subject(),
    sizeChange: new Subject(),
    control: new Subject()
  };
  private positionChangeSub?: Subscription;
  private resizeSub?: Subscription;
  private document = inject(DOCUMENT);

  constructor() {
    this.tourToken.control.subscribe(action => this.controlAction(action));
  }

  /**
   * Event triggered after the tour is completed.
   */
  readonly onTourComplete = new Subject<void>();

  /**
   * Event triggered after the tour is cancelled, either through skip button or closing the tour dialog.
   */
  readonly onTourCancel = new Subject<void>();

  /**
   * Sets options for the whole tour.
   */
  setOptions(options: TourOptions): void {
    Object.assign(this.options, options);
  }

  /**
   * Add steps to the tour
   */
  addSteps(steps: TourStep[]): void {
    this.steps.push(...steps);
  }

  /**
   * Clear all steps
   */
  clearSteps(): void {
    this.steps = [];
    this.currentStepIndex = -1;
  }

  /**
   * Start the tour
   */
  start(): void {
    this.makeStep(0);
  }

  /**
   * Finish the tour
   */
  complete(): void {
    this.controlAction('complete');
  }

  private async controlAction(action: TourAction): Promise<void> {
    switch (action) {
      case 'next':
        this.makeStep(this.currentStepIndex + 1);
        break;
      case 'back':
        this.makeStep(this.currentStepIndex - 1);
        break;
      case 'cancel':
        this.hide();
        this.onTourCancel.next();
        break;
      case 'complete':
        this.hide();
        this.onTourComplete.next();
        break;
    }
  }

  private async makeStep(index: number): Promise<void> {
    if (index < 0 || index >= this.steps.length) {
      return;
    }

    this.active = true;

    await this.handleBeforeNextPromise();

    this.currentStepIndex = index;
    const step = this.steps[this.currentStepIndex];
    this.currentStep = Object.assign({}, this.options?.defaultStepOptions ?? {}, step);

    if (this.currentStep.beforeShowPromise) {
      this.tourToken.blocked.set(true);
      await this.currentStep.beforeShowPromise();
    }

    if (!this.active) {
      // tour could have been cancelled before beforeShowPromise completes
      return;
    }

    const anchorElement = this.getElement(step.attachTo?.element);
    this.scrollIntoView(this.currentStep, anchorElement);

    const anchorElementRef = this.isElementVisible(anchorElement)
      ? new ElementRef(anchorElement!)
      : undefined;

    this.makeOverlay(anchorElementRef);
    this.handleResizeSubscription(anchorElementRef);

    this.tourToken.currentStep.next({
      step,
      stepNumber: this.currentStepIndex + 1,
      totalSteps: this.steps.length,
      anchor: anchorElementRef
    });
    this.tourToken.blocked.set(false);
  }

  private scrollIntoView(step: TourStep, element?: HTMLElement): void {
    if (!element || !(step.scrollTo || step.scrollToHandler)) {
      return;
    }
    if (step.scrollToHandler) {
      step.scrollToHandler(element);
    } else {
      element?.scrollIntoView(step.scrollTo);
    }
  }

  private async handleBeforeNextPromise(): Promise<void> {
    if (!this.active) {
      return;
    }
    if (this.currentStep?.beforeNextPromise) {
      this.tourToken.blocked.set(true);
      await this.currentStep.beforeNextPromise();
      this.tourToken.blocked.set(false);
    }
  }

  private makeOverlay(anchorElement: ElementRef<HTMLElement> | undefined): void {
    const strategy = makePositionStrategy(anchorElement, this.overlay, 'auto');
    this.handlePositionChangeSubscription(strategy, anchorElement);

    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(strategy);
      // This moves the dispatcher to the top, allowing it to catch other open overlays.
      // Much lighter than to detach and re-attach the portal, not re-creating the si-tour
      // component for each step
      this.outsideClickDispatcher.remove(this.overlayRef);
      this.outsideClickDispatcher.add(this.overlayRef);
      return;
    }

    const componentInjector = Injector.create({
      providers: [{ provide: SI_TOUR_TOKEN, useValue: this.tourToken }],
      parent: this.injector
    });

    // first the highlighter,
    const hlPortal = new ComponentPortal(SiTourHighlightComponent, undefined, componentInjector);
    this.overlayRefHighlight = this.overlay.create({
      positionStrategy: this.overlay.position().global()
    });
    this.overlayRefHighlight.attach(hlPortal);

    // then the dialog
    this.portal = new ComponentPortal(SiTourComponent, undefined, componentInjector);
    this.overlayRef = makeOverlay(strategy, this.overlay, true);
    // needs a subscriber, otherwise events will be ignored and the .backdrop CSS hack doesn't help
    this.overlayRef.outsidePointerEvents().subscribe();
    this.overlayRef.attach(this.portal);
  }

  private handleResizeSubscription(anchorElement: ElementRef<HTMLElement> | undefined): void {
    this.resizeSub?.unsubscribe();
    this.resizeSub = undefined;
    if (anchorElement) {
      this.resizeSub = merge(
        // this catches edge cases e.g. with side-panel
        this.resizeObserver.observe(this.document.body, 20, false),
        this.resizeObserver.observe(anchorElement.nativeElement, 20, false)
      )
        .pipe(
          throttleTime(20, undefined, { trailing: true }),
          map(() => undefined),
          tap(() => {
            if (!this.isElementVisible(anchorElement?.nativeElement)) {
              // repositions to center if anchor disappears
              this.makeOverlay(undefined);
            } else {
              this.overlayRef?.updatePosition();
            }
          })
        )
        .subscribe(this.tourToken.sizeChange);
    }
  }

  private isElementVisible(element: HTMLElement | undefined): boolean {
    const rect = element?.getBoundingClientRect();
    return !!rect?.width && !!rect.height;
  }

  private handlePositionChangeSubscription(
    strategy: PositionStrategy,
    anchor?: ElementRef<HTMLElement>
  ): void {
    this.positionChangeSub?.unsubscribe();
    if (anchor && strategy instanceof FlexibleConnectedPositionStrategy) {
      this.positionChangeSub = strategy.positionChanges
        .pipe(map(change => ({ change, anchor })))
        .subscribe(this.tourToken.positionChange);
    } else {
      this.tourToken.positionChange.next(undefined);
    }
  }

  private getElement(
    selectorOrElement?: string | HTMLElement | (() => string | HTMLElement)
  ): HTMLElement | undefined {
    if (typeof selectorOrElement === 'function') {
      selectorOrElement = selectorOrElement();
    }
    if (!selectorOrElement) {
      return undefined;
    }
    if (typeof selectorOrElement === 'string') {
      const element = this.document.querySelector<HTMLElement>(selectorOrElement);
      return element ?? undefined;
    }
    return selectorOrElement;
  }

  private async hide(): Promise<void> {
    await this.handleBeforeNextPromise();
    this.currentStepIndex = -1;
    this.currentStep = undefined;
    this.active = false;
    this.resizeSub?.unsubscribe();
    this.positionChangeSub?.unsubscribe();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.overlayRefHighlight?.dispose();
    this.overlayRefHighlight = undefined;
  }
}
