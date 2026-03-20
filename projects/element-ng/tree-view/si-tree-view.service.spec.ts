/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiTreeViewService } from './si-tree-view.service';

describe('SiTreeViewService', () => {
  let treeViewService: SiTreeViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiTreeViewService]
    });

    treeViewService = TestBed.inject(SiTreeViewService);
  });

  it('should create SiTreeViewService', () => {
    expect(treeViewService instanceof SiTreeViewService).toBe(true);
  });
});
