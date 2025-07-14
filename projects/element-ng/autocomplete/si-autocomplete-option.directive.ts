/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Highlightable } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  input
} from '@angular/core';

import { AUTOCOMPLETE_LISTBOX } from './si-autocomplete.model';

@Directive({
  selector: '[siAutocompleteOption]',
  exportAs: 'siAutocompleteOption',
  host: {
    role: 'option',
    '[id]': 'id()',
    '[attr.aria-disabled]': 'disabledInput()'
  }
})
export class SiAutocompleteOptionDirective<T = unknown> implements Highlightable {
  private static idCounter = 0;
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private parent = inject(AUTOCOMPLETE_LISTBOX);

  /**
   * @defaultValue
   * ```
   * `__si-autocomplete-option-${SiAutocompleteOptionDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-autocomplete-option-${SiAutocompleteOptionDirective.idCounter++}`);

  /** @defaultValue false */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  get disabled(): boolean {
    return this.disabledInput();
  }
  /** @defaultValue undefined */
  readonly value = input<T>(undefined, { alias: 'siAutocompleteOption' });

  @HostBinding('class.active') protected active?: boolean;

  @HostListener('click')
  protected click(): void {
    this.parent.siAutocompleteOptionSubmitted.emit(this.value());
  }

  /** @internal */
  setActiveStyles(): void {
    this.active = true;
    this.element.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  /** @internal */
  setInactiveStyles(): void {
    this.active = false;
  }
}
