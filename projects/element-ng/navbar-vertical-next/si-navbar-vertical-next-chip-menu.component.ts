/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
  Overlay
} from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { Component, inject, linkedSignal, viewChild } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/**
 * Chip button + chip menu overlay. Mounted by the navbar in inline-collapse
 * mode when an active root item exists.
 * @experimental
 */
@Component({
  selector: 'si-navbar-vertical-next-chip-menu',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus, PortalModule, SiIconComponent],
  templateUrl: './si-navbar-vertical-next-chip-menu.component.html',
  styleUrl: './si-navbar-vertical-next-chip-menu.component.scss'
})
export class SiNavbarVerticalNextChipMenuComponent {
  private static menuIdCounter = 0;

  /** Parent navbar host. */
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);

  private readonly chipOrigin = viewChild(CdkOverlayOrigin);

  /** DOM id wiring the chip button's `aria-controls` to the overlay panel.
   * @internal
   */
  readonly menuId = `si-navbar-vertical-next-chip-menu-${SiNavbarVerticalNextChipMenuComponent.menuIdCounter++}`;

  /** DOM id wiring the chip label to the overlay panel's `aria-labelledby`.
   * @internal
   */
  readonly menuLabelId = `${this.menuId}-label`;

  /**
   * `true` when the overlay is open.
   *
   * @defaultValue false
   * @internal
   */
  readonly open = linkedSignal({
    source: () => this.navbar.collapsed(),
    computation: (collapsed, previous): boolean => (collapsed ? (previous?.value ?? false) : false)
  });

  /** @internal */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
  ];

  /** @internal */
  protected readonly scrollStrategy = inject(Overlay).scrollStrategies.reposition();

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

  /** @internal */
  protected onOutsideClick(event: MouseEvent): void {
    // Chip button click is handled by toggle(); ignore here.
    if (!this.chipOrigin()?.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
