/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  TemplateRef
} from '@angular/core';
import { getOverlay, getPositionStrategy, hasTrigger, positions } from '@siemens/element-ng/common';
import { Subject, takeUntil } from 'rxjs';

import { PopoverComponent } from './si-popover.component';

@Directive({
  selector: '[siPopover]',
  exportAs: 'si-popover'
})
export class SiPopoverDirective implements OnInit, OnDestroy {
  /**
   * The popover text to be displayed
   */
  readonly siPopover = input<string | TemplateRef<any>>();

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
   * The trigger event(s) on which the popover shall be displayed.
   * Applications can pass multiple triggers separated by space.
   * Supported events are 'click', 'hover' and 'focus'.
   *
   * **Limitations:**
   * Safari browsers do not raise a 'focus' event on host element click and 'focus'
   * on tab key has to be enabled in the advanced browser settings.
   *
   * @defaultValue 'click'
   */
  readonly triggers = input('click');

  /**
   * The title to be displayed on top for the popover
   *
   * @defaultValue ''
   */
  readonly popoverTitle = input('');

  /**
   * The class that will be applied to container of the popover
   *
   * @defaultValue ''
   */
  readonly containerClass = input('');

  /**
   * The flag determines whether to close popover on clicking outside
   *
   * @defaultValue true
   */
  readonly outsideClick = input(true, { transform: booleanAttribute });

  /**
   * The icon to be displayed besides popover title
   */
  readonly icon = input<string>();

  /**
   * Specify whether or not the popover is currently shown
   *
   * @defaultValue false
   */
  readonly isOpen = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });

  /**
   * The context for the attached template
   */
  readonly popoverContext = input<unknown>();

  /**
   * Emits an event when the popover is shown
   */
  readonly shown = output<void>();

  /**
   * Emits an event when the popover is hidden
   */
  readonly hidden = output<void>();

  private overlayref?: OverlayRef;
  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);
  private destroyer = new Subject<void>();

  ngOnInit(): void {
    if (this.isOpen()) {
      this.show();
    }
  }

  ngOnDestroy(): void {
    this.overlayref?.dispose();
    this.destroyer.next();
    this.destroyer.complete();
  }

  /**
   * Displays popover and emits 'shown' event.
   */
  show(): void {
    if (!this.overlayref?.hasAttached()) {
      const triggers = this.triggers();
      const backdrop =
        this.outsideClick() && !hasTrigger('focus', triggers) && !hasTrigger('hover', triggers);
      this.overlayref = getOverlay(
        this.elementRef,
        this.overlay,
        backdrop,
        this.placementInternal()
      );
      if (backdrop) {
        this.overlayref
          .backdropClick()
          .pipe(takeUntil(this.destroyer))
          .subscribe(() => this.hide());
      }
    }

    if (this.overlayref.hasAttached()) {
      return;
    }
    const popoverPortal = new ComponentPortal(PopoverComponent);
    const popoverRef: ComponentRef<PopoverComponent> = this.overlayref.attach(popoverPortal);

    popoverRef.setInput('popover', this.siPopover());
    popoverRef.setInput('popoverTitle', this.popoverTitle());
    popoverRef.setInput('icon', this.icon());
    popoverRef.setInput('containerClass', this.containerClass());
    popoverRef.setInput('popoverContext', this.popoverContext());

    const positionStrategy = getPositionStrategy(this.overlayref);
    positionStrategy?.positionChanges
      .pipe(takeUntil(this.destroyer))
      .subscribe(change => popoverRef.instance.updateArrow(change, this.elementRef));

    this.shown.emit();
  }

  /**
   * Hides the popover and emits 'hidden' event.
   */
  hide(): void {
    if (this.overlayref?.hasAttached()) {
      this.overlayref?.detach();
      this.hidden.emit();
      this.destroyer.next();
    }
  }

  /**
   * Updates the position of the popover based on the position strategy.
   */
  updatePosition(): void {
    this.overlayref?.updatePosition();
  }

  @HostListener('mouseenter', ['"hover"'])
  @HostListener('mouseleave', ['"hover"'])
  @HostListener('focus', ['"focus"'])
  @HostListener('click', ['"click"'])
  protected onTrigger(trigger: string): void {
    if (hasTrigger(trigger, this.triggers())) {
      if (this.overlayref?.hasAttached()) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  @HostListener('touchstart')
  @HostListener('focusout')
  protected focusOut(): void {
    if (hasTrigger('focus', this.triggers())) {
      if (this.outsideClick()) {
        this.hide();
      }
    }
  }
}
