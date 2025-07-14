/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { SiNoTranslateService } from '@siemens/element-translate-ng/translate';

@Injectable({ providedIn: 'root' })
export class SiTranslateNgLocalizeService extends SiNoTranslateService {
  override prevent$LocalizeInit = true;
}
