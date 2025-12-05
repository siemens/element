/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

/**
 * Directive to emit events on element size change. Use like this:
 *   `<div (siResizeObserver)="handleResize($event)">`
 * When the size of the element changes, an event in the format
 *   `{ width: number, height: number }`
 * will be emitted. Also an initial event will be emitted on init.
 *
 * By default, events are throttled and to an event every 100ms. To change
 * this, add `[resizeThrottle]="200"` on the same element. Input in milliseconds.
 */
@Directive({
  selector: '[siResizeObserver]'
})
export class SiResizeObserverDirective implements OnInit {
  /** @defaultValue 100 */
  readonly resizeThrottle = input(100);
  /** @defaultValue true */
  readonly emitInitial = input(true, { transform: booleanAttribute });
  readonly siResizeObserver = output<ElementDimensions>();

  private destroyRef = inject(DestroyRef);
  private element = inject(ElementRef);
  private service = inject(ResizeObserverService);

  ngOnInit(): void {
    this.service
      .observe(this.element.nativeElement, this.resizeThrottle(), this.emitInitial())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.siResizeObserver.emit(value));
  }
}
