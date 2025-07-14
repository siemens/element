/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiTreeViewComponent,
    FormsModule,
    ReactiveFormsModule,
    SiFormItemComponent,
    SiNumberInputComponent
  ],
  templateUrl: './si-tree-view-playground.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly folders = new FormControl<number>(2, { nonNullable: true });
  readonly children = new FormControl<number>(10, { nonNullable: true });
  dynamicItems = 1;
  readonly treeItems: TreeItem[] = [
    {
      label: 'Company1',
      state: 'collapsed',
      dataField2: 'Smart Infrastructure',
      stateIndicatorColor: 'red',
      icon: 'element-automation-station',
      children: [
        {
          label: 'Milano',
          state: 'collapsed',
          selectable: false,
          dataField1: 'MIL',
          dataField2: 'Details',
          icon: 'element-plant',
          templateName: 'child',
          children: [
            {
              label: '1st Floor',
              dataField1: '001',
              state: 'leaf'
            },
            {
              label: '2nd Floor',
              dataField1: '002',
              state: 'leaf'
            },
            {
              label: '3rd Floor',
              dataField1: '003',
              state: 'leaf'
            },
            {
              label: '4th Floor',
              dataField1: '004',
              state: 'leaf'
            },
            {
              label: '5th Floor',
              dataField1: '005',
              showCheckbox: true,
              icon: 'element-automation-station',
              state: 'leaf'
            },
            {
              label: '6th Floor',
              dataField1: '006',
              showOptionbox: true,
              icon: 'element-automation-station',
              state: 'leaf'
            },
            {
              label: '7th Floor',
              dataField1: '007',
              showOptionbox: true,
              state: 'leaf'
            }
          ]
        },
        {
          label: 'Chicago',
          state: 'collapsed',
          dataField1: 'CHI',
          stateIndicatorColor: 'red',
          icon: 'element-plant',
          children: [
            {
              label: '1st Floor',
              dataField1: '001',
              state: 'leaf'
            },
            {
              label: '2nd Floor',
              dataField1: '002',
              state: 'leaf'
            },
            {
              label: '3rd Floor',
              dataField1: '003',
              state: 'leaf'
            },
            {
              label: '4th Floor',
              dataField1: '004',
              state: 'leaf'
            }
          ]
        },
        {
          label: 'Pune',
          state: 'collapsed',
          dataField1: 'PUN',
          icon: 'element-plant',
          children: [
            {
              label: '1st Floor',
              dataField1: '001',
              state: 'leaf'
            },
            {
              label: '2nd Floor',
              dataField1: '002',
              state: 'leaf'
            },
            {
              label: '3rd Floor',
              dataField1: '003',
              state: 'leaf'
            },
            {
              label: '4th Floor',
              dataField1: '004',
              state: 'leaf'
            }
          ]
        },
        {
          label: 'Zug',
          dataField1: 'ZG',
          state: 'collapsed',
          icon: 'element-plant',
          children: [
            {
              label: 'Data1',
              dataField1: 'ZW',
              state: 'collapsed',
              children: [
                {
                  label: '1st Floor',
                  dataField1: '001',
                  state: 'leaf'
                },
                {
                  label: '2nd Floor',
                  dataField1: '002',
                  state: 'leaf'
                },
                {
                  label: '3rd Floor, testing long texts to check scrolling/overflow behavior',
                  dataField1: '003',
                  stateIndicatorColor: 'blue',
                  state: 'leaf',
                  badge: '42'
                },
                {
                  label: '4th Floor',
                  dataField1: '004',
                  state: 'leaf'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      label: 'Company2',
      state: 'collapsed',
      dataField1: 'GG',
      dataField2: "We don't care about your privacy",
      icon: 'element-project',
      children: [
        {
          label: 'Mountain View',
          state: 'collapsed',
          dataField1: 'SFR'
        },
        {
          label: 'Zurich',
          state: 'collapsed',
          dataField1: 'ZRH',
          stateIndicatorColor: 'red'
        },
        {
          label: 'New York',
          state: 'collapsed',
          dataField1: 'NYC'
        },
        {
          label: 'Tokyo',
          state: 'collapsed',
          dataField1: 'TYO'
        }
      ]
    }
  ];

  compactMode = false;
  flatTree = false;
  isVirtualized = true;
  groupedList = false;
  dataField1 = true;
  dataField2 = false;
  stateIndicator = true;
  icon = true;
  inheritChecked = true;
  checkbox = false;
  optionbox = false;
  menuButton = true;
  selection = true;
  singleSelectMode = true;
  focus = true;
  folderStateStart = true;
  horizontalScrolling = false;
  classTreeSm = false;
  classTreeXs = false;
  expandOnClick = false;
  showExpandCollapseAll = false;
  disableFilledIcons = false;
  readonly menuItems: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Hello',
      action: (param: any) => this.logEvent('call command', param)
    },
    { type: 'action', label: 'World', action: (param: any) => this.logEvent('call command', param) }
  ];

  loadChildren = (event: any): void => {
    this.logEvent('loadChildren', event.treeItem.label);
    const level = event.treeItem.level + 1;
    const dynamicChildren: TreeItem[] = [];
    for (let index = 0; index < this.folders.value; index++) {
      dynamicChildren.push({
        label: `Dynamic Foldable L${level}-I${this.dynamicItems++}`,
        state: 'collapsed',
        icon: 'element-plant',
        children: []
      });
    }
    for (let index = 0; index < this.children.value; index++) {
      dynamicChildren.push({
        label: `Dynamic Child L${level}-I${this.dynamicItems++}`,
        state: 'leaf',
        icon: 'element-plant',
        children: []
      });
    }

    // mock async behavior so that it shows spinner
    setTimeout(() => {
      event.callback(event.treeItem, dynamicChildren);
    }, 1000);
  };

  logTreeItems(eventName: string, items: TreeItem[]): void {
    this.logEvent(
      eventName,
      items.map(item => item.label)
    );
  }
}
