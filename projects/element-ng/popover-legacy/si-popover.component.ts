/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef
} from '@angular/core';
import { calculateOverlayArrowPosition, OverlayArrowPosition } from '@siemens/element-ng/overlay';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-popover',
  imports: [NgTemplateOutlet, SiIconComponent],
  templateUrl: './si-popover.component.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class PopoverComponent implements OnInit {
  /** Text or template content displayed in the popover. */
  readonly popover = input<string | TemplateRef<any>>();
  /**
   * Title displayed at the top of the popover.
   *
   * @defaultValue ''
   */
  readonly popoverTitle = input('');
  /**
   * CSS class applied to the popover container.
   *
   * @defaultValue ''
   */
  readonly containerClass = input('');
  /** Icon displayed beside the popover title. */
  readonly icon = input<string>();
  /** Context provided to the popover template. */
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
