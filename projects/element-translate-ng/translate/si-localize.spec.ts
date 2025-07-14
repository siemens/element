/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiTranslatableService } from './si-translatable.service';

describe('siLocalize', () => {
  @Injectable({ providedIn: 'root' })
  class TestService {
    withoutDescription = $localize`:@@without:without-default`;
    withDescription = $localize`:with-desc@@with:with-default`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SiTranslatableService,
          useValue: jasmine.createSpyObj('SiTranslatableService', ['resolveText'])
        }
      ]
    });
  });

  it('should resolve $localize calls', () => {
    TestBed.inject(TestService); // we don't need a reference to this
    const translatableMock = TestBed.inject(
      SiTranslatableService
    ) as jasmine.SpyObj<SiTranslatableService>;
    expect(translatableMock.resolveText).toHaveBeenCalledWith('without', 'without-default');
    expect(translatableMock.resolveText).toHaveBeenCalledWith('with', 'with-default');
  });
});
