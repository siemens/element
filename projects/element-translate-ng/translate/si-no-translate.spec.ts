/**
 * Copyright (c) Siemens 2016 - 2025
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

  it('should return language code from different browser locales', () => {
    // Mock different browser languages
    const originalNavigator = window.navigator;

    // Test German
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, language: 'de-DE' },
      writable: true
    });
    expect(getBrowserLanguage()).toBe('de');

    // Test French
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, language: 'fr-FR' },
      writable: true
    });
    expect(getBrowserLanguage()).toBe('fr');

    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });
});
