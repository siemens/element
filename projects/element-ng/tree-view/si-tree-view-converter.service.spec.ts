/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, TestBed, waitForAsync } from '@angular/core/testing';

import { SiTreeViewConverterService } from './si-tree-view-converter.service';
import { SiTreeViewService } from './si-tree-view.service';

export const main = (): void => {
  describe('SiTreeViewConverterService', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [SiTreeViewService, SiTreeViewConverterService]
      }).compileComponents();
    }));

    it('should create SiTreeViewConverterService', inject(
      [SiTreeViewConverterService],
      (treeConverterService: SiTreeViewConverterService) => {
        expect(treeConverterService instanceof SiTreeViewConverterService).toBe(true);
      }
    ));
  });
};
