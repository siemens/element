/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import type { TreeItem } from '@siemens/element-ng/tree-view';

export const treeItems: TreeItem[] = [
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
  },
  {
    label: 'Company3',
    dataField1: 'GG',
    icon: 'element-project',
    children: [
      {
        label: 'Child Company3'
      }
    ]
  }
];

export const treeItemsUnderMaintenance: TreeItem[] = [
  {
    label: 'Zug',
    icon: 'element-project',
    state: 'expanded',
    customData: {
      locatorId: 'zug'
    },
    children: [
      {
        label: 'Building Zug 1',
        icon: 'element-building',
        state: 'expanded',
        customData: {
          locatorId: 'zugB1'
        },
        children: [
          {
            label: 'Air Conditioning Unit',
            state: 'leaf',
            icon: 'element-vrf'
          },
          {
            label: 'Elevator',
            state: 'leaf',
            icon: 'element-elevator'
          },
          {
            label: 'Lighting System',
            state: 'leaf',
            icon: 'element-sun'
          }
        ]
      },
      {
        label: 'Building Zug 2',
        icon: 'element-building',
        customData: {
          locatorId: 'zugB2'
        },
        children: [
          {
            label: 'Solar Panels',
            state: 'leaf',
            icon: 'element-solar-power'
          },
          {
            label: 'Elevator',
            state: 'leaf',
            icon: 'element-elevator'
          },
          {
            label: 'Fire Sensor',
            state: 'leaf',
            icon: 'element-fire-sensor'
          }
        ]
      }
    ]
  },
  {
    label: 'Milano',
    state: 'expanded',
    icon: 'element-project',
    customData: {
      locatorId: 'milano'
    },
    children: [
      {
        label: 'Building Milano 1',
        icon: 'element-building',
        state: 'expanded',
        customData: {
          locatorId: 'milanoB1'
        },
        children: [
          {
            label: 'HVAC System',
            state: 'leaf',
            icon: 'element-greenleaf'
          },
          {
            label: 'Security cameras',
            state: 'leaf',
            icon: 'element-security-cam'
          }
        ]
      },
      {
        label: 'Building Milano 2',
        icon: 'element-building',
        customData: {
          locatorId: 'milanoB2'
        },
        children: [
          {
            label: 'Fire Alarm',
            state: 'leaf',
            icon: 'element-detector-sound-plate'
          },
          {
            label: 'Wi-Fi Router',
            state: 'leaf',
            icon: 'element-router'
          }
        ]
      }
    ]
  }
];
export const treeItemsWithCompletedMaintenance: TreeItem[] = [
  {
    label: 'Zug',
    icon: 'element-project',
    state: 'expanded',
    customData: {
      locatorId: 'zug'
    },
    children: [
      {
        label: 'Building Zug 1',
        icon: 'element-building',
        state: 'expanded',
        customData: {
          locatorId: 'zugB1'
        },
        children: [
          {
            label: 'Solar Panels',
            state: 'leaf',
            icon: 'element-solar-power'
          }
        ]
      },
      {
        label: 'Building Zug 2',
        icon: 'element-building',
        customData: {
          locatorId: 'zugB2'
        },
        children: [
          {
            label: 'Lighting System',
            state: 'leaf',
            icon: 'element-sun'
          }
        ]
      }
    ]
  },
  {
    label: 'Milano',
    icon: 'element-project',
    state: 'expanded',
    customData: {
      locatorId: 'milano'
    },
    children: [
      {
        label: 'Building Milano 1',
        state: 'expanded',
        customData: {
          locatorId: 'milanoB1'
        },
        children: [
          {
            label: 'Fire Alarm',
            icon: 'element-detector-sound-plate',
            state: 'leaf'
          }
        ]
      },
      {
        label: 'Building Milano 2',
        customData: {
          locatorId: 'milanoB2'
        },
        children: [
          {
            label: 'Security cameras',
            state: 'leaf',
            icon: 'element-security-cam'
          }
        ]
      }
    ]
  }
];
