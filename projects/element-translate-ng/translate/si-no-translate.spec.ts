/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiTranslateModule } from './si-translate.module';
import { SiTranslateService } from './si-translate.service';

describe('SiNoTranslate', () => {
  let service: SiTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule]
    });
  });
  beforeEach(() => {
    service = TestBed.inject(SiTranslateService);
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

  it('should translate async', (done: DoneFn) => {
    service.translateAsync('VALUE-2').subscribe(value => {
      expect(value).toBe('VALUE-2');
      done();
    });
  });

  it('should translate sync', () => {
    expect(service.translateSync('VALUE-3')).toBe('VALUE-3');
  });
});
