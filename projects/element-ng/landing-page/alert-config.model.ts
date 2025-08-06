/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { StatusType } from '@spike-rabbit/element-ng/common';
import { Link } from '@spike-rabbit/element-ng/link';

export interface AlertConfig {
  severity: StatusType;
  heading?: string;
  message: string;
  action?: Link;
  translationParams?: { [key: string]: any };
}
