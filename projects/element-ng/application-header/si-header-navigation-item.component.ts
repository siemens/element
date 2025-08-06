/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  SI_HEADER_DROPDOWN_OPTIONS,
  SiHeaderDropdownTriggerDirective
} from '@spike-rabbit/element-ng/header-dropdown';
import { addIcons, elementDown2, SiIconNextComponent } from '@spike-rabbit/element-ng/icon';

/** Adds a navigation item to the header. Should be located inside `.header-navigation`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-header-navigation-item], a[si-header-navigation-item]',
  imports: [SiIconNextComponent],
  template: `
    <div class="item-title">
      <ng-content />
    </div>
    @if (dropdownTrigger) {
      <si-icon-next class="dropdown-caret" [icon]="icons.elementDown2" />
    }
  `,
  providers: [
    { provide: SI_HEADER_DROPDOWN_OPTIONS, useValue: { disableRootFocusTrapForInlineMode: true } }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'header-item focus-inside',
    '[class.dropdown-toggle]': '!!dropdownTrigger'
  }
})
export class SiHeaderNavigationItemComponent {
  /** @internal */
  dropdownTrigger = inject(SiHeaderDropdownTriggerDirective, {
    self: true,
    optional: true
  });
  protected readonly icons = addIcons({ elementDown2 });
}
