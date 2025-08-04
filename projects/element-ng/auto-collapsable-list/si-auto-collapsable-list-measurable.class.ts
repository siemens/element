/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, inject } from '@angular/core';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

@Directive()
export class SiAutoCollapsableListMeasurable {
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly resizeObserverService = inject(ResizeObserverService);

  /**
   * Emits on element width changes.
   *
   * @defaultValue
   * ```
   * this.resizeObserverService
   *       .observe(this.elementRef.nativeElement, 0, true, true)
   *       .pipe(
   *         map(size => size.width),
   *         distinctUntilChanged(),
   *         shareReplay(1)
   *       )
   * ```
   */
  size$ = this.resizeObserverService.observe(this.elementRef.nativeElement, 0, true, true).pipe(
    map(size => size.width),
    distinctUntilChanged(),
    shareReplay(1)
  );
}
