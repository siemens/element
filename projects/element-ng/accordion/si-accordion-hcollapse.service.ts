/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/** @internal */
@Injectable({
  providedIn: null
})
export class SiAccordionHCollapseService {
  /**
   * Emitting the current horizontal collapsed state.
   *
   * @defaultValue undefined
   */
  readonly hcollapsed = signal<boolean | undefined>(undefined);
  /**
   * Subject to emit to open the accordion.
   */
  readonly open$ = new Subject();
}
