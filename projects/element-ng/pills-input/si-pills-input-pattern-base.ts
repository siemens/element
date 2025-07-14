/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { signal, Signal } from '@angular/core';

import {
  SiPillsInputValueHandlerTrigger,
  SiPillsInputValueParseResult
} from './si-pills-input-value-handler';

export const SEPARATOR_REGEX = /\s*[;,]\s*/g;

export abstract class SiPillsInputPatternBase {
  /**
   * Regex to split the input value into segments.
   *
   * @defaultValue SEPARATOR_REGEX
   */
  readonly separatorRegex = signal(SEPARATOR_REGEX);
  /** Regex to validate an input string item. */
  readonly validationRegex?: Signal<RegExp | undefined>;

  /** @internal */
  handle(
    value: string,
    trigger: SiPillsInputValueHandlerTrigger
  ): SiPillsInputValueParseResult | undefined {
    const segments = value.split(this.separatorRegex());
    const itemRegex = this.validationRegex?.();
    if (segments.length) {
      const newValue = trigger === 'input' ? segments.pop()! : '';
      if (
        segments.every(segment => {
          return segment && (!itemRegex || segment.match(itemRegex));
        })
      ) {
        return {
          newPills: segments,
          newValue
        };
      }
    }

    return {
      newPills: [],
      newValue: value
    };
  }
}
