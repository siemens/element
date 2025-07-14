/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/**
 * Gets the width of the scrollbar.  Nesc for windows
 * http://stackoverflow.com/a/13382873/888165
 */
@Injectable({ providedIn: 'root' })
export class ScrollbarHelper {
  private document = inject(DOCUMENT);

  /**
   * The width of the scrollbar.
   *
   * @defaultValue this.getWidth()
   */
  readonly width: number = this.getWidth();

  private getWidth(): number {
    const outer = this.document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    (outer.style as any).msOverflowStyle = 'scrollbar';
    this.document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    const inner = this.document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  }
}
