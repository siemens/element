/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import {
  calculateOverlayArrowPosition,
  isRTL,
  OverlayArrowPosition
} from '@siemens/element-ng/common';
import { addIcons, elementCancel, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';

import { PositionChange, SI_TOUR_TOKEN, TourAction, TourStepInternal } from './si-tour-token.model';

@Component({
  selector: 'si-tour',
  imports: [A11yModule, NgClass, SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-tour.component.html',
  styleUrl: './si-tour.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-step-id]': 'step()?.step?.id'
  }
})
export class SiTourComponent implements OnDestroy {
  protected readonly positionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);
  protected readonly step = signal<TourStepInternal | undefined>(undefined);
  protected readonly show = signal(false);
  protected readonly icons = addIcons({ elementCancel });
  protected tourToken = inject(SI_TOUR_TOKEN);

  protected backText = t(() => $localize`:@@SI_TOUR.BACK:Back`);
  protected nextText = t(() => $localize`:@@SI_TOUR.NEXT:Next`);
  protected skipText = t(() => $localize`:@@SI_TOUR.SKIP:Skip tour`);
  protected doneText = t(() => $localize`:@@SI_TOUR.DONE:Done`);
  protected ariaLabelClose = t(() => $localize`:@@SI_TOUR.CLOSE:Close`);
  protected progressText = t(() => $localize`:@@SI_TOUR.PROGRESS: {{step}} of {{total}}`);

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private subscription?: Subscription;
  private prevFocus: Element | null = null;

  private readonly focusTrap = viewChild<CdkTrapFocus>('focusTrap');
  private document = inject(DOCUMENT);

  constructor() {
    this.subscription = this.tourToken.currentStep.subscribe(step => {
      this.step.set(step);
      this.show.set(false);
      // prevents flickering during overlay reposition and arrow direction change
      setTimeout(() => {
        this.show.set(true);
        this.ensureFocused();
      }, 50);
    });
    this.subscription.add(
      this.tourToken.positionChange.subscribe(update => this.updatePosition(update))
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected action(action: TourAction): void {
    this.prevFocus = this.document.activeElement;
    this.tourToken.control.next(action);
  }

  protected ensureFocused(): void {
    // ensure focus is inside si-tour as other element might steal it, e.g. opening a menu
    const element = this.elementRef.nativeElement;
    if (!this.document.activeElement || !element.contains(this.document.activeElement)) {
      if (element.contains(this.prevFocus)) {
        (this.prevFocus as HTMLElement)?.focus?.();
      } else {
        this.focusTrap()?.focusTrap.focusInitialElement();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected keyListener(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.action('cancel');
        break;
      case 'ArrowLeft':
        this.action(isRTL() ? 'next' : 'back');
        break;
      case 'ArrowRight':
        this.action(isRTL() ? 'back' : 'next');
        break;
    }
  }

  private updatePosition(update: PositionChange | undefined): void {
    if (!update) {
      this.positionClass.set('');
      this.arrowPos.set(undefined);
      return;
    }

    const connPair = update.change.connectionPair;
    this.positionClass.set(`popover-${connPair.overlayX}-${connPair.overlayY}`);
    setTimeout(() =>
      this.arrowPos.set(
        calculateOverlayArrowPosition(update.change, this.elementRef, update.anchor)
      )
    );
  }
}
