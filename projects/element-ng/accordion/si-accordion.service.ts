/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import type { SiCollapsiblePanelComponent } from './si-collapsible-panel.component';

/** @internal */
@Injectable({
  providedIn: null
})
export class SiAccordionService {
  /** Emit the panel that was toggled so sibling panels can close. */
  readonly toggle$ = new Subject<SiCollapsiblePanelComponent>();
  /**
   * Subject to emit when the items should be expanded to their full height or restored to normal height.
   *
   * @defaultValue null
   */
  readonly fullHeight = signal<boolean | null>(null);
}
