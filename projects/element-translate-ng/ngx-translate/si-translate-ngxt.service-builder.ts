/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  SiTranslateService,
  SiTranslateServiceBuilder
} from '@siemens/element-translate-ng/translate';

import { SiTranslateNgxTService } from './si-translate-ngxt.service';

/**
 * Builds {@link SiTranslateNgxTService} for each {@link TranslateService}.
 * The builder will create a new Service if a new {@link TranslateService} is found to support the isolated mode.
 *
 * @internal
 */
@Injectable()
export class SiTranslateNgxTServiceBuilder extends SiTranslateServiceBuilder {
  private serviceCache = new Map<TranslateService, SiTranslateNgxTService>();

  buildService(injector: Injector): SiTranslateService {
    // Get instance of NGX Translate via injector instance of the current scope (see isolated mode)
    const ngxTranslateService = injector.get(TranslateService);

    let ngxTServiceWrapper = this.serviceCache.get(ngxTranslateService);
    if (!ngxTServiceWrapper) {
      ngxTServiceWrapper = new SiTranslateNgxTService(ngxTranslateService);
      this.serviceCache.set(ngxTranslateService, ngxTServiceWrapper);
    }

    return ngxTServiceWrapper;
  }
}
