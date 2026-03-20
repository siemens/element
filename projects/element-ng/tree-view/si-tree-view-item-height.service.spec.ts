/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewService } from './si-tree-view.service';

describe('SiTreeViewItemHeightService', () => {
  let siTreeViewItemHeightService: SiTreeViewItemHeightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiTreeViewService, SiTreeViewItemHeightService]
    });

    siTreeViewItemHeightService = TestBed.inject(SiTreeViewItemHeightService);
  });

  it('should create SiTreeViewItemHeightService', () => {
    expect(siTreeViewItemHeightService instanceof SiTreeViewItemHeightService).toBe(true);
  });
});
