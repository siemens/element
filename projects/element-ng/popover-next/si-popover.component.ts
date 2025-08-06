/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  DOCUMENT
} from '@angular/core';
import {
  calculateOverlayArrowPosition,
  OverlayArrowPosition
} from '@spike-rabbit/element-ng/common';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';

import { SiPopoverNextDirective } from './si-popover-next.directive';

@Component({
  selector: 'si-popover',
  imports: [NgClass, NgTemplateOutlet, SiIconNextComponent],
  templateUrl: './si-popover.component.html',
  host: {
    '[id]': 'this.popoverDirective().popoverId'
  }
})
export class PopoverComponent implements OnInit, OnDestroy {
  readonly popoverDirective = input.required<SiPopoverNextDirective>();
  readonly popoverWrapper = viewChild.required<ElementRef>('popoverWrapper');

  /** @internal */
  labelledBy: string | undefined;
  /** @internal */
  describedBy: string | undefined;
  protected readonly positionClass = signal('');
  protected readonly arrowPos = signal<OverlayArrowPosition | undefined>(undefined);
  protected popoverTemplate: TemplateRef<any> | null = null;
  protected injector = inject(Injector);

  private elementRef = inject(ElementRef);
  private focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private focusTrap?: ConfigurableFocusTrap;
  private readonly previouslyActiveElement = inject(DOCUMENT).activeElement;

  ngOnInit(): void {
    const popoverDirective = this.popoverDirective();
    const popover = popoverDirective.siPopoverNext();
    if (popover instanceof TemplateRef) {
      this.popoverTemplate = popover;
    }
    this.labelledBy = `__popover-title_${popoverDirective.popoverCounter}`;
    this.describedBy = `__popover-body_${popoverDirective.popoverCounter}`;

    this.applyFocus();
  }

  ngOnDestroy(): void {
    this.focusTrap?.destroy();
    if (
      this.previouslyActiveElement &&
      'focus' in this.previouslyActiveElement &&
      typeof this.previouslyActiveElement.focus === 'function'
    ) {
      this.previouslyActiveElement.focus();
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

  hide(): void {
    this.popoverDirective().hide();
  }

  private applyFocus(): void {
    // Using setTimeout ensures that SR first read `expanded` before we move the focus.
    setTimeout(async () => {
      const popoverWrapperEl = this.popoverWrapper().nativeElement;
      this.focusTrap = this.focusTrapFactory.create(this.popoverWrapper().nativeElement);
      const moved = await this.focusTrap.focusFirstTabbableElementWhenReady();
      if (!moved) {
        popoverWrapperEl.tabIndex = 0;
        popoverWrapperEl.focus();
      }
    });
  }
}
