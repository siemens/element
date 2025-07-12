/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  SiTreeViewComponent,
  SiTreeViewItemTemplateDirective,
  TreeItem
} from '@siemens/element-ng/tree-view';

@Component({
  selector: 'app-sample',
  imports: [SiTreeViewComponent, SiTreeViewItemTemplateDirective],
  templateUrl: './si-tree-view-template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  treeItems: TreeItem[] = [
    {
      label: 'Company1',
      dataField1: 'SI',
      stateIndicatorColor: 'red',
      icon: 'element-project',
      templateName: 'root',
      children: [
        {
          label: 'Milano',
          dataField1: 'MIL',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'Chicago',
          dataField1: 'CHI',
          stateIndicatorColor: 'red',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'Pune',
          dataField1: 'PUN',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'Zug',
          dataField1: 'ZUG',
          templateName: 'child',
          state: 'leaf'
        }
      ]
    },
    {
      label: 'Company2',
      dataField1: 'GG',
      icon: 'element-project',
      templateName: 'root',
      children: [
        {
          label: 'Mountain View',
          dataField1: 'SFR',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'Zurich',
          dataField1: 'ZRH',
          stateIndicatorColor: 'red',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'New York',
          dataField1: 'NYC',
          templateName: 'child',
          state: 'leaf'
        },
        {
          label: 'Tokyo',
          dataField1: 'TYO',
          templateName: 'child',
          state: 'leaf'
        }
      ]
    }
  ];
}
