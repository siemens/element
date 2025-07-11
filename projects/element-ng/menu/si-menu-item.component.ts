/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { addIcons, elementRight2, SiIconNextComponent } from '@siemens/element-ng/icon';

import { SiMenuItemBase } from './si-menu-item-base.directive';

@Component({
  selector: 'si-menu-item, a[si-menu-item], button[si-menu-item]',
  imports: [NgClass, SiIconNextComponent],
  templateUrl: './si-menu-item.component.html',
  styleUrl: './si-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered']
    }
  ]
})
export class SiMenuItemComponent extends SiMenuItemBase {
  private menuTrigger = inject(CdkMenuTrigger, { optional: true, self: true });
  protected readonly icons = addIcons({ elementRight2 });
  protected get hasSubmenu(): boolean {
    return !!this.menuTrigger?.menuTemplateRef;
  }
}
