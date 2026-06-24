/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComboboxPopup } from '@angular/aria/combobox';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { Directive, effect, inject, input, OnDestroy } from '@angular/core';

import { SiCustomSelectDirective } from './si-custom-select.directive';

/**
 * Structural directive marking the dropdown template for custom selects
 * built with {@link SiCustomSelectDirective}.
 *
 * When placed on an `<ng-template>`, it automatically registers the template
 * with the parent {@link SiCustomSelectDirective}.
 *
 * @example
 * ```html
 * <ng-template si-select-dropdown contentType="listbox">
 *   <!-- custom dropdown content -->
 * </ng-template>
 * ```
 *
 * @experimental
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[si-select-dropdown]',
  hostDirectives: [
    {
      directive: ComboboxPopup,
      inputs: ['combobox', 'popupType:contentType']
    }
  ]
})
export class SiSelectDropdownDirective implements OnDestroy {
  /**
   * Describes the kind of content rendered by the dropdown. The value is
   * forwarded to the `aria-haspopup` attribute of the combobox host of
   * the parent {@link SiCustomSelectDirective}.
   */
  readonly contentType = input.required<'listbox' | 'tree' | 'grid' | 'dialog'>();
  private focusTrapFactory = inject(FocusTrapFactory);
  private focusTrap: FocusTrap | undefined;
  private popup = inject(ComboboxPopup);
  constructor() {
    effect(() => {
      const isOpen = this.popup.combobox().expanded();
      if (isOpen && !this.focusTrap) {
        this.focusDropdown();
      }
    });
  }
  ngOnDestroy(): void {
    this.focusTrap?.destroy();
    this.popup.combobox().element.focus();
  }
  private focusDropdown(): void {
    // The popup widget element only exists once the dropdown content has
    // rendered; this effect re-runs when it becomes available.
    const popupElement = this.popup.controlTarget();
    if (!popupElement) {
      return;
    }
    // Defer to the next render so any asynchronously assigned roving tabindex
    // (e.g. tree or listbox items) is in place before the first focusable
    // element is selected.
    setTimeout(() => {
      this.focusTrap = this.focusTrapFactory.create(popupElement);
      this.focusTrap.focusFirstTabbableElementWhenReady();
    }, 0);

    popupElement.addEventListener('keydown', this.handleEscapeKeydown);
  }

  private handleEscapeKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.popup.combobox().expanded.set(false);
      this.popup.combobox().element.focus();
    }
  };
}
