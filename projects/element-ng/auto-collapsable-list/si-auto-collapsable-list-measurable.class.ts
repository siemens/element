/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { observeElementSize } from '@siemens/element-ng/resize-observer';

@Directive()
export class SiAutoCollapsableListMeasurable {
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly observedWidth = observeElementSize(this.elementRef, {
    mapFn: e => e.at(0)?.borderBoxSize.at(0)?.inlineSize
  });
  /** Emits content-box inline-size. */
  readonly inlineSize = computed(
    () => this.observedWidth() ?? this.elementRef.nativeElement.clientWidth
  );
}
