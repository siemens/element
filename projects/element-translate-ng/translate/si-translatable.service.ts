/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

import { SiNoTranslateService } from './si-no-translate.service';
import { SI_TRANSLATABLE_VALUES } from './si-translatable.model';
import { injectSiTranslateService } from './si-translate.inject';
import { SiTranslateService } from './si-translate.service';

@Injectable({
  providedIn: 'root'
})
export class SiTranslatableService {
  private readonly translatableValues: Record<string, string>;
  private readonly isNoTranslate: boolean;
  private readonly siTranslateService: SiTranslateService;

  constructor() {
    this.siTranslateService = injectSiTranslateService();
    const translateValues = inject(SI_TRANSLATABLE_VALUES, { optional: true });

    this.translatableValues = translateValues?.reduce((a, b) => ({ ...a, ...b })) ?? {};
    this.isNoTranslate = this.siTranslateService instanceof SiNoTranslateService;
  }

  resolveText(key: string, originalText: string): TranslatableString {
    if (this.siTranslateService.setTranslation) {
      this.siTranslateService.setTranslation(key, originalText);
    }

    return this.translatableValues[key] ?? (this.isNoTranslate ? originalText : key);
  }
}
