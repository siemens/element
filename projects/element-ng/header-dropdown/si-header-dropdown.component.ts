/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  inject,
  viewChild,
  DOCUMENT
} from '@angular/core';

import { SiHeaderDropdownTriggerDirective } from './si-header-dropdown-trigger.directive';
import { SI_HEADER_DROPDOWN_OPTIONS } from './si-header.model';

/**
 * Wrapper component for {@link SiHeaderDropdownItemComponent}.
 * Must only be opened using an {@link SiHeaderDropdownTriggerDirective}.
 */
@Component({
  selector: 'si-header-dropdown',
  imports: [A11yModule],
  templateUrl: './si-header-dropdown.component.html',
  styles: ':host.sub-menu {min-inline-size: 200px}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dropdown-menu position-static',
    role: 'group',
    '[id]': 'trigger.ariaControls',
    '[attr.aria-labelledby]': 'trigger.id'
  }
})
export class SiHeaderDropdownComponent {
  protected trigger = inject(SiHeaderDropdownTriggerDirective);

  private readonly focusTrap = viewChild.required(CdkTrapFocus);
  private previousElement: Element | null = null;
  private readonly document = inject(DOCUMENT);
  private readonly options = inject(SI_HEADER_DROPDOWN_OPTIONS, { optional: true });

  constructor() {
    // The autoFocus feature of the focus trap is not enough, as this component is not newly created when opened in mobile (inline).
    // But we still need autofocus in desktop mode, as the close event is never executed (component is destroyed before).
    this.trigger.openChange.subscribe(change => {
      if (!this.trigger.isOverlay && this.trapFocus && change) {
        this.previousElement = this.document.activeElement;
        this.focusTrap().focusTrap.focusFirstTabbableElementWhenReady();
      } else {
        if (
          this.previousElement &&
          'focus' in this.previousElement &&
          typeof this.previousElement.focus === 'function'
        ) {
          this.previousElement.focus();
        }
        this.previousElement = null;
      }
    });
  }

  @HostBinding('class.show')
  protected get show(): boolean {
    return this.trigger.isOpen;
  }

  @HostBinding('class.sub-menu') protected get submenu(): boolean {
    return this.trigger.level > 1;
  }

  protected get trapFocus(): boolean {
    return (
      this.trigger.isOverlay ||
      (!this.options?.disableRootFocusTrapForInlineMode && this.trigger.level === 1)
    );
  }

  @HostListener('keydown.escape')
  protected escape(): void {
    this.trigger?.close();
  }
}
