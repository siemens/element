/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DomPortal } from '@angular/cdk/portal';
import { Component, ElementRef, inject } from '@angular/core';

/**
 * Content slot for navbar items inside `si-navbar-vertical-next`.
 * Place `<a si-navbar-vertical-next-item>` and `<button si-navbar-vertical-next-item>` elements inside this component.
 * @experimental
 */
@Component({
  selector: 'si-navbar-vertical-next-items',
  template: '<ng-content />',
  styleUrl: './si-navbar-vertical-next-items.component.scss'
})
export class SiNavbarVerticalNextItemsComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** DOM portal that relocates the whole items container into the chip menu overlay.
   * @internal
   */
  readonly hostPortal = new DomPortal(this.elementRef.nativeElement);
}
