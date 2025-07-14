/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

export const LOG_EVENT = new InjectionToken<(...msg: any[]) => void>('si.live-previewer.log-event');
