/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';

import { SiTranslateNgLocalizeServiceBuilder } from './si-translate-ng-localize-service-builder.service';

/**
 * This module configures Element to work with \@angular/localize.
 * It should only be imported once in an application's root module (typically `app.module.ts`)
 */
@NgModule({
  providers: [{ provide: SiTranslateServiceBuilder, useClass: SiTranslateNgLocalizeServiceBuilder }]
})
export class SiTranslateNgLocalizeModule {}
