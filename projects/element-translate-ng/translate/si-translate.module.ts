/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Injector, NgModule } from '@angular/core';

import { SiNoTranslateServiceBuilder } from './si-no-translate.service-builder';
import { SiTranslatePipe } from './si-translate.pipe';
import { SiTranslateService } from './si-translate.service';
import { SiTranslateServiceBuilder } from './si-translate.service-builder';

/**
 * This provides declares SiTranslatePipe and provides a respective SiTranslateService.
 * It should be used internally of Element but NOT by any application
 *
 * @internal
 */
@NgModule({
  declarations: [SiTranslatePipe],
  exports: [SiTranslatePipe],
  providers: [
    /* This is needed for ngx-translate when using the isolated mode for lazy child routes.
     * In that case, a new TranslateService is created by ngx-translate which also needs to be used
     * by Element components within that route.
     * The Builder can be used to check if a new service is available
     * and then provide a corresponding SiTranslateService.
     */
    {
      provide: SiTranslateService,
      useFactory: (injector: Injector, noTranslateBuilder: SiNoTranslateServiceBuilder) =>
        injector.get(SiTranslateServiceBuilder, noTranslateBuilder).buildService(injector),
      deps: [Injector, SiNoTranslateServiceBuilder]
    }
  ]
})
export class SiTranslateModule {}
