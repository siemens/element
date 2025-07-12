/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CDK_MENU, CdkMenuItemCheckbox, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { addIcons, elementOk, SiIconNextComponent } from '@siemens/element-ng/icon';

import { SiMenuItemBase } from './si-menu-item-base.directive';

@Component({
  selector: 'si-menu-item-checkbox, button[si-menu-item-checkbox]',
  imports: [NgClass, SiIconNextComponent],
  templateUrl: './si-menu-item-checkbox.component.html',
  styleUrl: './si-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItemCheckbox,
      inputs: ['cdkMenuItemChecked: checked', 'cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered']
    },
    CdkMenuTrigger
  ]
})
export class SiMenuItemCheckboxComponent extends SiMenuItemBase {
  private cdkMenuItemCheckbox = inject(CdkMenuItemCheckbox);
  protected readonly icons = addIcons({ elementOk });
  protected readonly hideCheckmark = inject(CDK_MENU).orientation === 'horizontal';

  protected get checked(): boolean {
    return this.cdkMenuItemCheckbox.checked;
  }
}
