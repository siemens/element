/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { EventEmitter, Injectable, signal } from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';

/**
 * Provider for dynamic CDK directionality.
 *
 * CDK per default evaluates directionality once during initialization. This is a problem when
 * switching language later in the lifecycle. This provider can be used to make this dynamic.
 * To use, simply provide this in the `ApplicationConfig`:
 *
 * ```ts
 * import { Directionality } from '@angular/cdk/bidi';
 * import { SiDirectionality } from '@siemens/element-ng/localization';
 *
 * ...
 * export const APP_CONFIG: ApplicationConfig = {
 *   providers: [
 *     { provide: Directionality, useClass: SiDirectionality },
 *     ...
 *   ]
 * }
 *
 * bootstrapApplication(AppComponent, APP_CONFIG)
 *    ...
 *
 * ```
 */

@Injectable()
export class SiDirectionality implements Directionality {
  readonly change = new EventEmitter<Direction>();

  /** @defaultValue 'ltr' */
  readonly valueSignal = signal<Direction>('ltr');

  get value(): Direction {
    const dir = isRTL() ? 'rtl' : 'ltr';
    this.valueSignal.set(dir);
    return dir;
  }

  /** @internal */
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface, @angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {
    // empty, from Directionality
  }
}
