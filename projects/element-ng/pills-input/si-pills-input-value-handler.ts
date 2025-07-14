/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

export interface SiPillsInputValueParseResult {
  newValue: string;
  newPills: string[];
}

export type SiPillsInputValueHandlerTrigger = 'input' | 'keydown.enter' | 'blur';

@Directive()
export abstract class SiPillsInputValueHandlerDirective {
  /** @internal */
  abstract handle(
    value: string,
    trigger: SiPillsInputValueHandlerTrigger
  ): SiPillsInputValueParseResult | undefined;
}
