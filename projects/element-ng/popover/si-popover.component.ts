/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit, signal, TemplateRef } from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/common';
import { SiIconNextComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-popover',
  imports: [NgClass, NgTemplateOutlet, SiIconNextComponent],
  templateUrl: './si-popover.component.html'
})
export class PopoverComponent implements OnInit {
  readonly popover = input<string | TemplateRef<any>>();
  /** @defaultValue '' */
  readonly popoverTitle = input('');
  /** @defaultValue '' */
  readonly containerClass = input('');
  readonly icon = input<string>();
  readonly popoverContext = input<unknown>();

  protected readonly positionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);
  protected popoverTemplate: TemplateRef<any> | null = null;

  private elementRef = inject(ElementRef);

  ngOnInit(): void {
    const popover = this.popover();
    if (popover instanceof TemplateRef) {
      this.popoverTemplate = popover;
    }
  }

  /** @internal */
  updateArrow(change: ConnectedOverlayPositionChange, anchor?: ElementRef): void {
    const positionClass = `popover-${change.connectionPair.overlayX}-${change.connectionPair.overlayY}`;
    // need two updates as class changes affect the position
    this.positionClass.set(positionClass);
    const arrowPos = calculateOverlayArrowPosition(change, this.elementRef, anchor);
    this.arrowPos.set(arrowPos);
  }
}
