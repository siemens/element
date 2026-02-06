/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, input } from '@angular/core';

import { SiTooltipDirective } from './si-tooltip.directive';
import { SiTooltipService } from './si-tooltip.service';

/**
 * Directive for automatically showing tooltips on truncated text.
 * Extends SiTooltipDirective but with key differences:
 * - Does not set aria-describedby
 * - Automatically copies the element's text content
 * - Only shows when text is actually truncated
 */
@Directive({
  selector: '[siTooltipOverlay]',
  providers: [SiTooltipService],
  host: {
    '[attr.aria-describedby]': 'null',
    '(focus)': 'show(true)'
  }
})
export class SiTooltipOverlayDirective extends SiTooltipDirective {
  /**
   * Auto-detect text truncation and show it in the tooltip.
   * Pass true to check the host element, or an HTMLElement to check a specific element.
   *
   * @defaultValue false
   */
  readonly siTooltipOverlay = input(false, {
    transform: (value: boolean | HTMLElement | ''): boolean | HTMLElement => {
      return value === '' ? true : value;
    }
  });

  protected override show(immediate = false): void {
    const config = this.siTooltipOverlay();
    if (!config) {
      return;
    }

    const element = config === true ? this.elementRef.nativeElement : config;
    if (element.scrollWidth <= element.clientWidth) {
      return;
    }

    const content = element.textContent?.trim() ?? '';
    if (!content) {
      return;
    }

    this.showTooltipWithContent(content, immediate);
  }
}
