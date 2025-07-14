/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { SiTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';

import { SiTranslateNgxTServiceBuilder } from './si-translate-ngxt.service-builder';

/**
 * This module configures Element to use ngx-translate for translating {@link TranslatableString}
 * It should only be imported once in an applications root module (typically `app.module.ts`)
 */
@NgModule({
  providers: [{ provide: SiTranslateServiceBuilder, useClass: SiTranslateNgxTServiceBuilder }]
})
export class SiTranslateNgxTModule {}
