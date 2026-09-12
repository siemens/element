/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef
} from '@angular/core';
import {
  defaultConnectedOverlayScrollStrategy,
  isRTL,
  positions
} from '@siemens/element-ng/common';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';
import { Subject, takeUntil } from 'rxjs';

import { PopoverComponent } from './si-popover.component';

@Directive({
  selector: '[siPopover]',
  host: {
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'popoverId',
    '(click)': 'onClick()'
  },
  exportAs: 'si-popover'
})
export class SiPopoverDirective implements OnDestroy {
  private static idCounter = 0;

  /**
   * The popover text to be displayed
   */
  readonly siPopover = input<TranslatableString | TemplateRef<unknown>>();

  /**
   * The placement of the popover. One of 'top', 'start', 'end', 'bottom'
   *
   * @defaultValue 'auto'
   */
  readonly placement = input<keyof typeof positions>('auto', { alias: 'siPopoverPlacement' });

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
   *
   * @defaultValue undefined
   */
  readonly title = input<TranslatableString>(undefined, { alias: 'siPopoverTitle' });

  /**
   * The class that will be applied to container of the popover
   *
   * @defaultValue ''
   */
  readonly containerClass = input('', { alias: 'siPopoverContainerClass' });

  /**
   * The icon to be displayed besides popover title
   *
   * @defaultValue undefined
   */
  readonly icon = input<string>(undefined, { alias: 'siPopoverIcon' });

  /**
   * The context for the attached template
   *
   * @defaultValue undefined
   */
  readonly context = input<unknown>(undefined, { alias: 'siPopoverContext' });

  /**
   * CDK scroll strategy used for the popover overlay.
   *
   * @defaultValue defaultConnectedOverlayScrollStrategy()
   */
  readonly scrollStrategy = input(defaultConnectedOverlayScrollStrategy(), {
    alias: 'siPopoverScrollStrategy'
  });

  /**
   * Emits `true` when the popover is shown, `false` when the popover is hidden.
   */
  readonly visibilityChange = output<boolean>({ alias: 'siPopoverVisibilityChange' });

  /** @internal */
  readonly popoverCounter = SiPopoverDirective.idCounter++;
  /** @internal */
  readonly popoverId = `__popover_${this.popoverCounter}`;

  /** @internal */
  protected readonly isOpen = signal<boolean>(false);

  private overlayref?: OverlayRef;
  private popoverRef?: ComponentRef<PopoverComponent>;
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

    this.overlayref ??= this.createOverlay();

    const popoverPortal = new ComponentPortal(PopoverComponent);
    this.popoverRef = this.overlayref.attach(popoverPortal);

    this.popoverRef.setInput('popoverDirective', this);

    this.isOpen.set(true);
    this.visibilityChange.emit(true);
  }

  /**
   * Hides the popover and emits 'hidden' event.
   */
  hide(): void {
    this.overlayref?.detach();
  }

  /**
   * Updates the position of the popover based on the position strategy.
   */
  updatePosition(): void {
    this.overlayref?.updatePosition();
  }

  protected onClick(): void {
    if (this.overlayref?.hasAttached()) {
      this.hide();
    } else {
      this.show();
    }
  }

  private createOverlay(): OverlayRef {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPush(false)
      .withGrowAfterOpen(true)
      .withFlexibleDimensions(false)
      .withPositions(positions[this.placementInternal()]);
    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.scrollStrategy(),
      direction: isRTL() ? 'rtl' : 'ltr'
    });
    overlayRef
      .detachments()
      .pipe(takeUntil(this.destroyer))
      .subscribe(() => {
        this.popoverRef = undefined;
        if (this.isOpen()) {
          this.isOpen.set(false);
          this.visibilityChange.emit(false);
        }
      });
    overlayRef
      .outsidePointerEvents()
      .pipe(takeUntil(this.destroyer))
      .subscribe(({ target }) => {
        if (target !== this.elementRef.nativeElement) {
          this.hide();
        }
      });
    positionStrategy.positionChanges
      .pipe(takeUntil(this.destroyer))
      .subscribe(change => this.popoverRef?.instance.updateArrow(change, this.elementRef));
    return overlayRef;
  }
}
