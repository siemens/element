/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { addIcons, elementRecordFilled, SiIconNextComponent } from '@siemens/element-ng/icon';

import { SiMenuItemBase } from './si-menu-item-base.directive';

@Component({
  selector: 'si-menu-item-radio',
  templateUrl: './si-menu-item-radio.component.html',
  styleUrl: './si-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, SiIconNextComponent],
  hostDirectives: [
    {
      directive: CdkMenuItemRadio,
      inputs: ['cdkMenuItemChecked: checked', 'cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered']
    },
    CdkMenuTrigger
  ]
})
export class SiMenuItemRadioComponent extends SiMenuItemBase {
  private cdkMenuItemRadio = inject(CdkMenuItemRadio);
  protected readonly icons = addIcons({ elementRecordFilled });
  protected get checked(): boolean {
    return this.cdkMenuItemRadio.checked;
  }
}
