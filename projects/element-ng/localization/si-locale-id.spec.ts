/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiLocaleId } from './si-locale-id';
import { SiLocaleService } from './si-locale.service';

class SiLocaleServiceMock {
  locale = 'en';
}

describe('SiLocaleId', () => {
  let localeId: string;
  let siLocaleServiceMock: SiLocaleServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
        { provide: SiLocaleService, useClass: SiLocaleServiceMock }
      ]
    });
    localeId = TestBed.inject(LOCALE_ID).toString();
    siLocaleServiceMock = TestBed.inject(SiLocaleService);
  });

  it('should return the SiLocaleService local property on toString()', () => {
    expect(localeId.toString()).toBe('en');
  });

  it('should return en when siLocaleService locale is set to template', () => {
    siLocaleServiceMock.locale = 'template';
    expect(localeId.toString()).toBe('en');
  });
});
