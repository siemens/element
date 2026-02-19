/**
 * Copyright (c) Siemens 2016 - 2026
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
  private contextClasses: { [key: string]: string[] } = {
    'device': ['Option 1', 'Option 2', 'Option 3'],
    'geo': ['Option A', 'Option B', 'Option C'],
    'infra': ['Analyze', 'Map', 'Restructure'],
    'discDevices': ['Assign all', 'Forget all'],
    'assignedDevices': ['Remove all', 'Update']
  };

  private getRandomNumber(max: number): number {
    return this.getRandomBoolean() ? Math.ceil(Math.random() * max) : 0;
  }

  private getRandomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  private getRandomBadgeColor(): string {
    return this.getRandomBoolean() ? 'warning' : 'info';
  }

  private getRandomIcon(): string {
    return this.getRandomBoolean()
      ? this.getRandomBoolean()
        ? 'element-light'
        : 'element-light-on'
      : '';
  }

  menuItems: MenuItemsProvider = item => {
    const key = item.dataField2 as string;
    if (!key) return [];
    const options = this.contextClasses[key] || [];
    return options.map(option => ({
      title: option,
      badge: this.getRandomNumber(10),
      badgeColor: this.getRandomBadgeColor(),
      icon: this.getRandomIcon(),
      action: () => alert(`Performed action \"${option}\"`),
      disabled: false
    }));
  };

  treeItems: TreeItem[] = [
    {
      label: 'Discovered Devices',
      dataField2: 'discDevices',
      badge: '2',
      badgeColor: 'info',
      icon: 'element-show',
      children: [
        {
          label: 'Automation station',
          dataField1: '[AS_TRA_155]',
          icon: 'element-automation-station',
          dataField2: 'device',
          state: 'leaf'
        },
        {
          label: 'Unknown device',
          dataField1: '[X3_456_dfsda]',
          icon: 'element-device-alt',
          dataField2: 'device',
          state: 'leaf'
        }
      ]
    },
    {
      label: 'Geographical',
      icon: 'element-map-location',
      dataField2: 'geo',
      stateIndicatorColor: 'red',
      children: [
        {
          label: 'Mountain View',
          dataField1: 'SFR',
          state: 'leaf'
        },
        {
          label: 'Zurich',
          dataField1: 'ZRH',
          dataField2: 'geo',
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
    },
    {
      label: 'Infrastructure',
      dataField2: 'infra',
      icon: 'element-box'
      //state: 'leaf'
    },
    {
      label: 'Assigned Devices',
      icon: 'element-assigned',
      dataField2: 'assignedDevices',
      badge: '5',
      badgeColor: 'info',
      stateIndicatorColor: 'green',
      children: [
        {
          label: 'Automation station',
          dataField1: '[AS_TRA_152]',
          icon: 'element-automation-station',
          dataField2: 'device',
          stateIndicatorColor: 'green',
          children: [
            {
              label: 'Infrastructure',
              icon: 'element-box',
              state: 'leaf'
            },
            {
              label: 'I/O Bus',
              icon: 'element-network',
              state: 'leaf'
            },
            {
              label: 'KNX PL-Link Bus',
              icon: 'element-network-backbone',
              state: 'leaf'
            },
            {
              label: 'Room 1',
              icon: 'element-room',
              state: 'leaf'
            },
            {
              label: 'Room segment 1',
              icon: 'element-room-segment',
              state: 'leaf'
            },
            {
              label: 'HVAC',
              icon: 'element-ahu-plant',
              stateIndicatorColor: 'green',
              children: [
                {
                  label: 'Supply air VAV',
                  state: 'leaf'
                },
                {
                  label: 'Cooling coil',
                  state: 'leaf',
                  stateIndicatorColor: 'green'
                },
                {
                  label: 'Heating coil',
                  state: 'leaf'
                }
              ]
            }
          ]
        },
        {
          label: 'Automation station',
          dataField1: '[AS_TRA_155]',
          icon: 'element-automation-station',
          dataField2: 'device'
        },
        {
          label: 'Automation station',
          dataField1: '[AS_TRA_TX]',
          icon: 'element-automation-station',
          dataField2: 'device'
        },
        {
          label: 'POL687 VVS11',
          dataField1: '[SaturnCB-AS01]',
          icon: 'element-automation-station',
          dataField2: 'device'
        },
        {
          label: 'PXC AS02',
          dataField1: '[TPSite ‘S02]',
          icon: 'element-automation-station',
          dataField2: 'device'
        }
      ]
    }
  ];
}
