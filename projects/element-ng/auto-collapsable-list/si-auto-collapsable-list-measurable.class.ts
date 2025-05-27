/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

@Directive()
export class SiAutoCollapsableListMeasurable implements AfterViewInit {
  /** Emits on element width changes. */
  size$!: Observable<number>;

  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly resizeObserverService = inject(ResizeObserverService);

  ngAfterViewInit(): void {
    this.size$ = this.resizeObserverService
      .observe(this.elementRef.nativeElement, 0, true, true)
      .pipe(
        map(size => size.width),
        distinctUntilChanged(),
        shareReplay(1)
      );
  }
}
