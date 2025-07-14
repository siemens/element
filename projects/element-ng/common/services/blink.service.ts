/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  endWith,
  filter,
  map,
  repeat,
  share,
  takeUntil
} from 'rxjs/operators';

/**
 * A global blink pulse generator for synchronized blinking patterns across an entire application.
 * Use to trigger any blinking by subscribing to `pulse$`.
 */
@Injectable({ providedIn: 'root' })
export class BlinkService {
  private pause$ = new BehaviorSubject<boolean>(false);

  private off$ = this.pause$.pipe(filter(v => v));
  private on$ = this.pause$.pipe(filter(v => !v));

  /**
   * Blink pulse. Subscribe to it to toggle `on` CSS class when true, `off` CSS class when `false`.
   * Do animations using CSS transitions
   *
   * @defaultValue
   * ```
   * timer(0, 1400).pipe(
   *     map(count => count % 2 === 0),
   *     distinctUntilChanged(),
   *     takeUntil(this.off$),
   *     endWith(false),
   *     repeat({ delay: () => this.on$ }),
   *     share()
   *   )
   * ```
   */
  public readonly pulse$ = timer(0, 1400).pipe(
    map(count => count % 2 === 0),
    distinctUntilChanged(),
    takeUntil(this.off$),
    endWith(false),
    repeat({ delay: () => this.on$ }),
    share()
  );

  /**
   * Pause the blinking.
   */
  pause(): void {
    this.pause$.next(true);
  }

  /**
   * Resume the blinking.
   */
  resume(): void {
    this.pause$.next(false);
  }

  /**
   * Whether the blinking is paused or not.
   */
  isPaused(): boolean {
    return this.pause$.value;
  }
}
