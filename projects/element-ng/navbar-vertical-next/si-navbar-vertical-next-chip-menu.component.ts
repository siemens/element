/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { Subscription } from 'rxjs';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/**
 * Chip button + chip menu overlay. Mounted by the navbar in inline-collapse
 * mode when an active root item exists.
 * @experimental
 */
@Component({
  selector: 'si-navbar-vertical-next-chip-menu',
  imports: [CdkTrapFocus, PortalModule, SiIconComponent],
  templateUrl: './si-navbar-vertical-next-chip-menu.component.html',
  styleUrl: './si-navbar-vertical-next-chip-menu.component.scss'
})
export class SiNavbarVerticalNextChipMenuComponent {
  private static menuIdCounter = 0;

  /** Parent navbar host. */
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Chip button; origin of the overlay's position strategy.
   * @internal
   */
  private readonly chipButton = viewChild<ElementRef<HTMLElement>>('chipButton');

  /** Chip menu overlay template.
   * @internal
   */
  private readonly chipMenuTemplate = viewChild<TemplateRef<unknown>>('chipMenuTemplate');

  /** DOM id wiring the chip button's `aria-controls` to the overlay panel.
   * @internal
   */
  readonly menuId = `si-navbar-vertical-next-chip-menu-${SiNavbarVerticalNextChipMenuComponent.menuIdCounter++}`;

  /**
   * `true` when the overlay is open.
   *
   * @defaultValue false
   * @internal
   */
  readonly open = linkedSignal({
    source: () => this.navbar.collapsed(),
    computation: (collapsed, previous) => (collapsed ? (previous?.value ?? false) : false)
  });

  private overlayRef?: OverlayRef;
  private outsidePointerSub?: Subscription;

  constructor() {
    // Recreate the overlay per open/close so button re-creation or template
    // swaps always start from a clean state.
    effect(() => {
      const open = this.open();
      const template = this.chipMenuTemplate();
      const button = this.chipButton();
      untracked(() => {
        this.detachOverlay();
        if (open && template && button) {
          this.attachOverlay(template, button);
        }
      });
    });

    this.destroyRef.onDestroy(() => this.detachOverlay());
  }

  /** Toggles the overlay open state. */
  protected toggle(): void {
    this.open.update(open => !open);
  }

  /** Closes the overlay.
   * @internal
   */
  close(): void {
    this.open.set(false);
  }

  private attachOverlay(templateRef: TemplateRef<unknown>, button: ElementRef<HTMLElement>): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(button.nativeElement)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false
    });
    this.overlayRef.attach(new TemplatePortal(templateRef, this.viewContainerRef));

    this.outsidePointerSub = this.overlayRef.outsidePointerEvents().subscribe(event => {
      // Chip button click is handled by `toggle()`; ignore here.
      if (button.nativeElement.contains(event.target as Node)) {
        return;
      }
      this.close();
    });
  }

  private detachOverlay(): void {
    this.outsidePointerSub?.unsubscribe();
    this.outsidePointerSub = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
