/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent,
  ViewType
} from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiContentActionBarComponent],
  templateUrl: './si-content-action-bar-states.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  viewType: ViewType = 'expanded';

  secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Title - Normal', action: () => alert('Item Clicked') },
    {
      type: 'action',
      label: 'Title - Disabled',
      action: () => alert('Item Clicked'),
      disabled: true
    },
    {
      type: 'group',
      label: 'Sub-Menu',
      children: [
        { type: 'action', label: 'Title - Normal', action: () => alert('Item Clicked') },
        {
          type: 'action',
          label: 'Title - Disabled',
          action: () => alert('Item Clicked'),
          disabled: true
        }
      ]
    },
    {
      type: 'group',
      label: 'Badges',
      children: [
        { type: 'action', label: 'Badge', action: () => alert('Item Clicked'), badge: 5 },
        {
          type: 'action',
          label: 'Badge - warning',
          action: () => alert('Item Clicked'),
          badge: 5,
          badgeColor: 'warning'
        },
        {
          type: 'action',
          label: 'Badge - success',
          action: () => alert('Item Clicked'),
          badge: 5,
          badgeColor: 'success'
        },
        {
          type: 'action',
          label: 'Badge - disabled',
          action: () => alert('Item Clicked'),
          disabled: true,
          badge: 5,
          badgeColor: 'warning'
        }
      ]
    },
    { type: 'link', label: 'Element', href: 'https://element.siemens.io/', target: '_blank' }
  ];

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Title - Normal', action: () => alert('Item Clicked') },
    {
      type: 'action',
      label: 'Title - Disabled',
      action: () => alert('Item Clicked'),
      disabled: true
    },
    {
      type: 'group',
      label: 'Primary-Sub-Menu',
      children: [
        {
          type: 'action',
          label: 'Primary-Sub-Menu-Item - Normal',
          action: () => alert('Item Clicked')
        },
        {
          type: 'action',
          label: 'Primary-Sub-Menu-Item - Disabled',
          action: () => alert('Item Clicked'),
          disabled: true
        }
      ]
    },
    {
      type: 'checkbox',
      label: 'Toggle',
      icon: 'element-edit',
      iconOnly: true,
      checked: true,
      action: (_, item) => (item.checked = !item.checked)
    }
  ];

  disabledPrimaryItems: ContentActionBarMainItem[] = [
    {
      type: 'group',
      label: 'Menu 1',
      disabled: true,
      children: [
        { type: 'action', label: 'Item 1', action: () => alert('Item clicked'), disabled: false },
        { type: 'action', label: 'Item 2', action: () => alert('Item clicked'), disabled: false }
      ]
    },
    {
      type: 'group',
      label: 'Menu 2',
      disabled: true,
      children: [
        { type: 'action', label: 'Item 1', action: () => alert('Item clicked'), disabled: true },
        { type: 'action', label: 'Item 2', action: () => alert('Item clicked'), disabled: true }
      ]
    },
    {
      type: 'group',
      label: 'Long-List',
      children: Array.from({ length: 50 }, (_, i) => ({
        type: 'action',
        label: `Item ${i + 1}`,
        action: () => alert(`Item ${i + 1} Clicked`)
      }))
    },
    {
      type: 'group',
      label: 'Menu 3',
      disabled: false,
      children: [
        { type: 'action', label: 'Item 1', action: () => alert('Item clicked'), disabled: true },
        { type: 'action', label: 'Item 2', action: () => alert('Item clicked'), disabled: true }
      ]
    },
    {
      type: 'group',
      label: 'Menu 4',
      disabled: false,
      children: [
        { type: 'action', label: 'Item 1', action: () => alert('Item clicked'), disabled: false },
        { type: 'action', label: 'Item 2', action: () => alert('Item clicked'), disabled: true }
      ]
    }
  ];
}
