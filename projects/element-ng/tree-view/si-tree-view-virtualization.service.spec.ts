/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, TestBed, waitForAsync } from '@angular/core/testing';

import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewVirtualizationService } from './si-tree-view-virtualization.service';
import { TreeItem } from './si-tree-view.model';
import { SiTreeViewService } from './si-tree-view.service';

export const main = (): void => {
  const treeRoot: TreeItem[] = [
    {
      label: 'Company1',
      dataField1: 'SI',
      stateIndicatorColor: 'red',
      icon: 'element-project',
      children: [
        {
          label: 'Milano',
          dataField1: 'MIL'
        },
        {
          label: 'Buffalo Grove',
          dataField1: 'BG',
          stateIndicatorColor: 'red'
        },
        {
          label: 'Pune',
          dataField1: 'PUN'
        },
        {
          label: 'Zug'
        }
      ]
    },
    {
      label: 'Company2',
      dataField1: 'Gg',
      icon: 'element-project',
      children: [
        {
          label: 'G-Milano',
          dataField1: 'G-MIL'
        },
        {
          label: 'G-Buffalo Grove',
          dataField1: 'G-BG',
          stateIndicatorColor: 'red'
        },
        {
          label: 'G-Pune',
          dataField1: 'G-PUN'
        },
        {
          label: 'G-Zug',
          dataField1: 'G-ZUG'
        }
      ]
    },
    {
      label: 'Company3',
      dataField1: 'MS',
      icon: 'element-project',
      children: [
        {
          label: 'M-Milano',
          dataField1: 'M-MIL',
          state: 'leaf'
        },
        {
          label: 'M-Buffalo Grove',
          dataField1: 'M-BG',
          stateIndicatorColor: 'red',
          state: 'leaf'
        },
        {
          label: 'M-Pune',
          dataField1: 'M-PUN',
          state: 'leaf'
        },
        {
          label: 'M-Zug',
          dataField1: 'M-ZUG',
          state: 'leaf'
        }
      ]
    }
  ];

  describe('ListVirtualizationService', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [SiTreeViewService, SiTreeViewItemHeightService, SiTreeViewVirtualizationService]
      }).compileComponents();
    }));

    it('should create ListVirtualizationService', inject(
      [SiTreeViewVirtualizationService, SiTreeViewService, SiTreeViewItemHeightService],
      (
        listVirtualizationService: SiTreeViewVirtualizationService,
        treeViewService: SiTreeViewService,
        listItemHeightService: SiTreeViewItemHeightService
      ) => {
        expect(listVirtualizationService instanceof SiTreeViewVirtualizationService).toBe(true);
        listVirtualizationService.handleScroll(2, treeRoot);
        treeViewService.groupedList = true;
        listVirtualizationService.handleScroll(2, treeRoot);
        listItemHeightService.itemHeight = 0;
        treeViewService.groupedList = true;
        listVirtualizationService.handleScroll(4, treeRoot);
        listItemHeightService.itemHeight = 0;
        listVirtualizationService.handleScroll(2, treeRoot);
      }
    ));
  });
};
