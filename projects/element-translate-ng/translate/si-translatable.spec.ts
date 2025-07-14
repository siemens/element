/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiNoTranslateService } from './si-no-translate.service';
import { SI_TRANSLATABLE_VALUES } from './si-translatable.model';
import { SiTranslatableService } from './si-translatable.service';
import { SiTranslateService } from './si-translate.service';

describe('SiTranslatable', () => {
  let service: SiTranslatableService;

  describe('with SiTranslateService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: SiTranslateService, useClass: SiNoTranslateService },
          { provide: SI_TRANSLATABLE_VALUES, useValue: { KEY1: 'value1' }, multi: true },
          { provide: SI_TRANSLATABLE_VALUES, useValue: { KEY2: 'value2' }, multi: true }
        ]
      });
      service = TestBed.inject(SiTranslatableService);
    });

    it('should translate keys', () => {
      expect(service.resolveText('KEY1', 'value')).toBe('value1');
      expect(service.resolveText('KEY2', 'value')).toBe('value2');
      expect(service.resolveText('KEY3', 'value')).toBe('value');
    });
  });

  describe('without SiTranslateService', () => {
    it('should use SiNoTranslateService by default', () => {
      service = TestBed.inject(SiTranslatableService);
      expect(service.resolveText('KEY', 'value')).toBe('value');
    });
  });
});
