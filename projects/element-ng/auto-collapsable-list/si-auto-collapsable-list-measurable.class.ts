/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { observeElementSize } from '@siemens/element-ng/resize-observer';

/**
 * Base class for components/directives that need to measure their own size via ResizeObserver.
 */
@Directive()
export class SiAutoCollapsableListMeasurable {
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly resizeEntry = observeElementSize(this.elementRef, { box: 'border-box' });
  /**
   * The inline-size (border-box) of the element.
   * @internal
   */
  readonly inlineSize = computed(() => this.resizeEntry()?.borderBoxSize[0].inlineSize);
}
