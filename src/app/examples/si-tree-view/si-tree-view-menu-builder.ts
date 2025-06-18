/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItemsProvider, SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';

@Component({
  selector: 'app-sample',
  templateUrl: './si-tree-view-menu-builder.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiTreeViewComponent]
})
export class SampleComponent {
  menuItemProvider: MenuItemsProvider = (item: TreeItem) => [
    { title: `${item.label} Alert`, action: () => alert(`Warm greetings from ${item.label}.`) }
  ];

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
          state: 'leaf'
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
