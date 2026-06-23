/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Option } from '@angular/aria/listbox';
import {
  booleanAttribute,
  Directive,
  input
} from '@angular/core';


@Directive({
  selector: '[siAutocompleteOption]',
  /*host: {
    role: 'option',
    '[id]': 'id()',
    '[attr.aria-disabled]': 'disabledInput()'
  },*/
  hostDirectives: [{
    directive: Option,
    inputs: ['disabled', 'value: siAutocompleteOption', 'id', 'label']
  }],
  exportAs: 'siAutocompleteOption'
})
export class SiAutocompleteOptionDirective<T = unknown> {
  private static idCounter = 0;

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

  //@HostBinding('class.active') protected active?: boolean;

  /*@HostListener('click')
  protected click(): void {
    this.parent.siAutocompleteOptionSubmitted.emit(this.value());
  }*/

  /** @internal */
  /*setActiveStyles(): void {
    //this.active = true;
    this.element.nativeElement.scrollIntoView({ block: 'nearest' });
  }*/

  /** @internal */
  setInactiveStyles(): void {
    //this.active = false;
  }
}
