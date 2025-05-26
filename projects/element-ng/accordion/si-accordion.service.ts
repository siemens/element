/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/** @internal */
@Injectable({
  providedIn: null
})
export class SiAccordionService {
  /**
   * Emit an item in the accordion which should be toggled.
   */
  readonly toggle$ = new Subject<any>();
  /**
   * Subject to emit when the items should be expanded to their full height or restored to normal height.
   *
   * @defaultValue null
   */
  readonly fullHeight = signal<boolean | null>(null);
}
