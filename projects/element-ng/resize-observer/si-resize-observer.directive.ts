/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { Subscription } from 'rxjs';

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
export class SiResizeObserverDirective implements OnInit, OnDestroy {
  /** @defaultValue 100 */
  readonly resizeThrottle = input(100);
  /** @defaultValue true */
  // TODO: switch default to false in v48.0.0
  readonly emitInitial = input(true, { transform: booleanAttribute });
  readonly siResizeObserver = output<ElementDimensions>();

  private subs?: Subscription;
  private element = inject(ElementRef);
  private service = inject(ResizeObserverService);

  ngOnInit(): void {
    this.subs = this.service
      .observe(this.element.nativeElement, this.resizeThrottle(), this.emitInitial())
      .subscribe(value => this.siResizeObserver.emit(value));
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }
}
