/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SkipLinkService } from './skip-link.service';

/**
 * Directive to mark an element as a target for a skip link.
 * If this directive is applied to a none interactive element, a tabindex of -1 must be added manually.
 */
@Directive({
  selector: '[siSkipLinkTarget]'
})
export class SiSkipLinkTargetDirective implements OnInit, OnDestroy {
  /**
   * The name of the skip link target which will be shown in the skip link.
   */
  readonly name = input.required<TranslatableString>({ alias: 'siSkipLinkTarget' });

  private skipLinkService = inject(SkipLinkService);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.skipLinkService.registerLink(this);
  }

  ngOnDestroy(): void {
    this.skipLinkService.unregisterLink(this);
  }

  /**
   * Call this methode to "activate" a skip link target. It will focus this element and scroll it into the view.
   */
  jumpToThisTarget(): void {
    this.elementRef.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.elementRef.nativeElement.focus();
  }
}
