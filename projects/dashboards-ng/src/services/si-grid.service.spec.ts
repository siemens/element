/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiGridService } from './si-grid.service';

describe('SiGridService', () => {
  let service: SiGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiGridService]
    });
    service = TestBed.inject(SiGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getWidget()', () => {
    it('should return undefined for an unknown id', () => {
      expect(service.getWidget('x')).toBeUndefined();
    });

    it('should return the widget of the id', () => {
      service.widgetCatalog = [
        {
          id: 'id',
          name: 'widget',
          componentFactory: {
            componentName: '',
            moduleName: '',
            moduleLoader: () => Promise.reject()
          }
        }
      ];
      expect(service.getWidget('id')).toBe(service.widgetCatalog[0]);
    });
  });
});
