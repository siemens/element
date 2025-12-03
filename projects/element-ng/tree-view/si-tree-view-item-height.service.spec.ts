/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';

import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewService } from './si-tree-view.service';

export const main = (): void => {
  describe('SiTreeViewItemHeightService', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          SiTreeViewService,
          SiTreeViewItemHeightService,
          provideZonelessChangeDetection()
        ]
      }).compileComponents();
    }));

    it('should create SiTreeViewItemHeightService', inject(
      [SiTreeViewItemHeightService],
      (siTreeViewItemHeightService: SiTreeViewItemHeightService) => {
        expect(siTreeViewItemHeightService instanceof SiTreeViewItemHeightService).toBe(true);
      }
    ));
  });
};
