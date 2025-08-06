/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import {
  SiTranslateService,
  SiTranslateServiceBuilder
} from '@spike-rabbit/element-translate-ng/translate';

import { SiTranslateNgLocalizeService } from './si-translate-ng-localize.service';

/**
 * Similar to the no-translate builder, but this one is not initializing the Element version of $localize,
 * as it will be provided by angular.
 */
@Injectable()
export class SiTranslateNgLocalizeServiceBuilder extends SiTranslateServiceBuilder {
  private siTranslateNgService = inject(SiTranslateNgLocalizeService);

  override buildService(): SiTranslateService {
    return this.siTranslateNgService;
  }
}
