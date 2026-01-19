/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, TestBed } from '@angular/core/testing';

import { SiTreeViewService } from './si-tree-view.service';

export const main = (): void => {
  describe('SiTreeViewService', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [SiTreeViewService]
      }).compileComponents();
    });

    it('should create SiTreeViewService', inject(
      [SiTreeViewService],
      (treeViewService: SiTreeViewService) => {
        expect(treeViewService instanceof SiTreeViewService).toBe(true);
      }
    ));
  });
};
