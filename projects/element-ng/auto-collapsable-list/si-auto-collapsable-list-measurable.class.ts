/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { observeSize } from '@siemens/element-ng/resize-observer';

@Directive()
export class SiAutoCollapsableListMeasurable {
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly dimensions = observeSize(this.elementRef, { throttle: 0 });

  /**
   * The element's width in pixels. Observation ends when the directive is destroyed.
   */
  readonly size = computed(() => this.dimensions().width);
}
