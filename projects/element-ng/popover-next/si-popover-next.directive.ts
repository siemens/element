/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef
} from '@angular/core';
import { getOverlay, getPositionStrategy, positions } from '@siemens/element-ng/common';
import { Subject, takeUntil } from 'rxjs';

import { PopoverComponent } from './si-popover.component';

@Directive({
  selector: '[siPopoverNext]',
  exportAs: 'si-popover-next',
  host: {
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'popoverId'
  }
})
export class SiPopoverNextDirective implements OnDestroy {
  private static idCounter = 0;

  /**
   * The popover text to be displayed
   */
  readonly siPopoverNext = input<string | TemplateRef<unknown>>();

  /**
   * The placement of the popover. One of 'top', 'start', end', 'bottom'
   *
   * @defaultValue 'auto'
   */
  readonly placement = input<keyof typeof positions>('auto');

  readonly placementInternal = computed(() => {
    if (
      this.placement() !== 'top' &&
      this.placement() !== 'bottom' &&
      this.placement() !== 'start' &&
      this.placement() !== 'end'
    ) {
      return 'auto';
    } else {
      return this.placement();
    }
  });

  /**
   * The title to be displayed on top for the popover
   */
  readonly popoverTitle = input<string>();

  /**
   * The class that will be applied to container of the popover
   *
   * @defaultValue ''
   */
  readonly containerClass = input('');

  /**
   * The icon to be displayed besides popover title
   */
  readonly icon = input<string>();

  /**
   * The context for the attached template
   */
  readonly popoverContext = input<unknown>();

  /**
   * Emits an event when the popover is shown/hidden
   */
  readonly visibilityChange = output<void>();

  readonly popoverCounter = SiPopoverNextDirective.idCounter++;
  readonly popoverId = `__popover_${this.popoverCounter}`;

  protected readonly isOpen = signal<boolean>(false);

  private overlayref?: OverlayRef;
  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);
  private destroyer = new Subject<void>();

  ngOnDestroy(): void {
    this.overlayref?.dispose();
    this.destroyer.next();
    this.destroyer.complete();
  }

  /**
   * Displays popover and emits 'shown' event.
   */
  show(): void {
    if (this.overlayref?.hasAttached()) {
      return;
    }
    this.overlayref = getOverlay(this.elementRef, this.overlay, false, this.placementInternal());
    this.overlayref
      .outsidePointerEvents()
      .pipe(takeUntil(this.destroyer))
      .subscribe(({ target }) => {
        if (target !== this.elementRef.nativeElement) {
          this.hide();
        }
      });

    const popoverPortal = new ComponentPortal(PopoverComponent);
    const popoverRef: ComponentRef<PopoverComponent> = this.overlayref.attach(popoverPortal);

    popoverRef.setInput('popoverDirective', this);

    const positionStrategy = getPositionStrategy(this.overlayref);
    positionStrategy?.positionChanges
      .pipe(takeUntil(this.destroyer))
      .subscribe(change => popoverRef.instance.updateArrow(change, this.elementRef));

    this.isOpen.set(true);
    this.visibilityChange.emit();
  }

  /**
   * Hides the popover and emits 'hidden' event.
   */
  hide(): void {
    if (this.overlayref?.hasAttached()) {
      this.overlayref?.detach();
      this.isOpen.set(false);
      this.visibilityChange.emit();
      this.destroyer.next();
    }
  }

  /**
   * Updates the position of the popover based on the position strategy.
   */
  updatePosition(): void {
    this.overlayref?.updatePosition();
  }

  @HostListener('click')
  protected onClick(): void {
    if (this.overlayref?.hasAttached()) {
      this.hide();
    } else {
      this.show();
    }
  }
}
