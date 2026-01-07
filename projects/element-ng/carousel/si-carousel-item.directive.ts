/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, ElementRef, inject, signal } from '@angular/core';

import { SiCarouselComponent } from './si-carousel.component';

@Directive({
  selector: '[siCarouselItem]',
  host: {
    style: 'flex-shrink: 0; flex-basis: 100%; scroll-snap-align: center;',
    '[style.order]': 'order()',
    'role': 'group',
    '[attr.aria-roledescription]': 'carousel.translatedSlideRoleDescription()',
    '[attr.inert]': 'isVisible() ? null : ""',
    '[attr.aria-hidden]': 'isVisible() ? null : "true"'
  }
})
export class SiCarouselItemDirective {
  protected readonly carousel = inject(SiCarouselComponent);
  protected readonly isVisible = computed(() => {
    if (this.carousel.currentActiveSlide() === this.elementRef) {
      return true;
    }
    return false;
  });
  /** @internal */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /** @internal */
  readonly order = signal(0);
}
