/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuBar, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive, inject, input } from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-menu-bar',
  host: {
    class: 'd-inline-flex',
    style: 'gap: 1px',
    '[tabindex]': 'tabIndex',
    '[class.dark-background]': "colorVariant() === 'base-0'"
  },
  hostDirectives: [CdkMenuBar, CdkTargetMenuAim]
})
export class SiMenuBarDirective {
  private menuBar = inject(CdkMenuBar, { self: true });

  /**
   * Sets the menu-bar disabled, i.e. sets tabindex="-1"
   */
  readonly disabled = input<boolean>();

  /**
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');

  protected get tabIndex(): 0 | -1 | null {
    return this.disabled() ? -1 : this.menuBar._getTabIndex();
  }
}
