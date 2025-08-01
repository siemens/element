/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItemsProvider, SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';

@Component({
  selector: 'app-sample',
  imports: [SiTreeViewComponent],
  templateUrl: './si-tree-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  menuItems: MenuItemsProvider = item =>
    Math.random() < 0.5 || item.level === 0
      ? [
          {
            title: 'Item One',
            badge: 5,
            badgeColor: 'danger',
            action: () => alert('action one'),
            disabled: true
          },
          { title: '-' },
          {
            title: 'Item Two',
            items: [
              {
                title: 'Item Three',
                icon: 'element-play',
                action: (param: any) => alert('action three at ' + param)
              }
            ]
          }
        ]
      : [];

  treeItems: TreeItem[] = [
    {
      label: 'Company1',
      dataField1: 'SI',
      stateIndicatorColor: 'red',
      icon: 'element-project',
      children: [
        {
          label: 'Milano',
          dataField1: 'MIL',
          state: 'leaf',
          badge: '1',
          badgeColor: 'info'
        },
        {
          label: 'Chicago',
          dataField1: 'CHI',
          stateIndicatorColor: 'red',
          state: 'leaf'
        },
        {
          label: 'Pune',
          dataField1: 'PUN',
          state: 'leaf'
        },
        {
          label: 'Zug',
          dataField1: 'ZUG',
          children: [
            {
              label: 'Example Location 1',
              state: 'leaf'
            },
            {
              label: 'Example Location 2',
              state: 'leaf'
            },
            {
              label: 'Example Location 3',
              state: 'leaf'
            },
            {
              label: 'Example Location 4',
              state: 'leaf'
            },
            {
              label: 'Example Location 5',
              state: 'leaf'
            },
            {
              label: 'Example Location 6',
              state: 'leaf'
            },
            {
              label: 'Example Location 7',
              state: 'leaf'
            }
          ]
        }
      ]
    },
    {
      label: 'Company2',
      dataField1: 'GG',
      icon: 'element-project',
      children: [
        {
          label: 'Mountain View',
          dataField1: 'SFR',
          state: 'leaf'
        },
        {
          label: 'Zurich',
          dataField1: 'ZRH',
          stateIndicatorColor: 'red',
          state: 'leaf'
        },
        {
          label: 'New York',
          dataField1: 'NYC',
          state: 'leaf'
        },
        {
          label: 'Tokyo',
          dataField1: 'TYO',
          state: 'leaf'
        }
      ]
    }
  ];
}
