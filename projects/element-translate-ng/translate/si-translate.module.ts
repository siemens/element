/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { injectSiTranslateService } from './si-translate.inject';
import { SiTranslatePipe } from './si-translate.pipe';
import { SiTranslateService } from './si-translate.service';

/**
 * This provides declares SiTranslatePipe and provides a respective SiTranslateService.
 * It should be used internally of Element but NOT by any application.
 *
 * @deprecated This module is no longer needed.
 * Replace it with the {@link SiTranslatePipe} if needed, otherwise drop it without replacement.
 *
 * @internal
 */
@NgModule({
  imports: [SiTranslatePipe],
  providers: [
    /* This is needed for ngx-translate when using the isolated mode for lazy child routes.
     * In that case, a new TranslateService is created by ngx-translate which also needs to be used
     * by Element components within that route.
     * The Builder can be used to check if a new service is available
     * and then provide a corresponding SiTranslateService.
     */
    {
      provide: SiTranslateService,
      useFactory: () => injectSiTranslateService()
    }
  ],
  exports: [SiTranslatePipe]
})
export class SiTranslateModule {}
