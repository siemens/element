/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CDK_MENU } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[si-content-action-bar-toggle]',
  imports: [SiIconComponent],
  templateUrl: './si-content-action-bar-toggle.component.html',
  styleUrl: './si-content-action-bar-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'btn btn-tertiary btn-icon flex-grow-0 focus-inside',
    '[class.in-bar]': 'isInBar'
  }
})
export class SiContentActionBarToggleComponent {
  readonly icon = input.required<string>();

  private readonly parentMenu = inject(CDK_MENU, { optional: true });

  protected get isInBar(): boolean {
    return this.parentMenu?.orientation === 'horizontal';
  }
}
