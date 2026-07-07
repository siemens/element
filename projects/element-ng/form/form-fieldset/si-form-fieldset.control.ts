/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Signal } from '@angular/core';

import type { SiFormError } from '../si-form-item/si-form-item.component';

export interface SiFormFieldsetControl {
  readonly control: Signal<unknown>;
  readonly required: Signal<boolean>;
  readonly touched: Signal<boolean>;
  readonly errors: Signal<readonly SiFormError[]>;
}
