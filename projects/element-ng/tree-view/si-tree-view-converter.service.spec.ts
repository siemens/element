/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiTreeViewConverterService } from './si-tree-view-converter.service';
import { SiTreeViewService } from './si-tree-view.service';

describe('SiTreeViewConverterService', () => {
  let treeConverterService: SiTreeViewConverterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [SiTreeViewService, SiTreeViewConverterService]
    }).compileComponents();

    treeConverterService = TestBed.inject(SiTreeViewConverterService);
  });

  it('should create SiTreeViewConverterService', () => {
    expect(treeConverterService instanceof SiTreeViewConverterService).toBe(true);
  });
});
