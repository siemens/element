/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InteractivityChecker } from '@angular/cdk/a11y';
import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SkipLinkService } from './skip-link.service';

/**
 * Directive to mark an element as a target for a skip link.
 * Focuses the target if it is focusable, otherwise its first usable tabbable descendant.
 * Add tabindex="-1" to a non-interactive element to focus the target itself.
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
  private interactivityChecker = inject(InteractivityChecker);

  ngOnInit(): void {
    this.skipLinkService.registerLink(this);
  }

  ngOnDestroy(): void {
    this.skipLinkService.unregisterLink(this);
  }

  /**
   * Activate a skip link target by scrolling it into view and focusing it or its first tabbable descendant.
   */
  jumpToThisTarget(): void {
    const target = this.elementRef.nativeElement;
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    if (this.interactivityChecker.isFocusable(target)) {
      target.focus();
      return;
    }

    for (const descendant of target.querySelectorAll<HTMLElement>('*')) {
      if (
        this.interactivityChecker.isFocusable(descendant) &&
        this.interactivityChecker.isTabbable(descendant)
      ) {
        descendant.focus();
        return;
      }
    }
  }
}
