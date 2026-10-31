/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { injectSiTranslateService } from './si-translate.inject';
import { getBrowserLanguage, SiTranslateService } from './si-translate.service';

describe('SiNoTranslate', () => {
  let service: SiTranslateService;

  beforeEach(() => {
    service = TestBed.runInInjectionContext(() => injectSiTranslateService());
  });

  it('should translate', () => {
    expect(service.translate('VALUE-1')).toBe('VALUE-1');
  });

  it('should translate multiple keys', () => {
    expect(service.translate(['VALUE-1', 'VALUE-2', 'VALUE-3'])).toEqual({
      'VALUE-1': 'VALUE-1',
      'VALUE-2': 'VALUE-2',
      'VALUE-3': 'VALUE-3'
    });
  });

  it('should translate async', async () => {
    const value = await firstValueFrom(service.translateAsync('VALUE-2'));
    expect(value).toBe('VALUE-2');
  });

  it('should translate sync', () => {
    expect(service.translateSync('VALUE-3')).toBe('VALUE-3');
  });

  it.each([
    ['de-DE', 'de'],
    ['fr-FR', 'fr']
  ])('should return language code for browser locale %s', (locale, language) => {
    using languagesSpy = vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([locale]);

    expect(getBrowserLanguage()).toBe(language);
    expect(languagesSpy).toHaveBeenCalled();
  });
});
