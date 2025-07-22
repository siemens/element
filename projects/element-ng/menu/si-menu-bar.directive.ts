/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuBar, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive, HostBinding, inject, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-menu-bar',
  host: {
    class: 'd-inline-flex',
    style: 'gap: 1px'
  },
  hostDirectives: [CdkMenuBar, CdkTargetMenuAim]
})
export class SiMenuBarDirective {
  private menuBar = inject(CdkMenuBar, { self: true });

  @HostBinding('tabindex')
  protected get tabIndex(): 0 | -1 | null {
    return this.disabled() ? -1 : this.menuBar._getTabIndex();
  }

  /**
   * Sets the menu-bar disabled, i.e. sets tabindex="-1"
   */
  readonly disabled = input<boolean>();
}
