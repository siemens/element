/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { observeElementSize } from '@siemens/element-ng/resize-observer';

@Directive()
export class SiAutoCollapsableListMeasurable {
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly resizeEntries = observeElementSize(this.elementRef, { box: 'border-box' });
  /** Emits border-box inline-size. */
  readonly inlineSize = computed(
    () =>
      this.resizeEntries().at(0)?.borderBoxSize.at(0)?.inlineSize ??
      this.elementRef.nativeElement.clientWidth
  );
}
