/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox } from '@angular/aria/listbox';
import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';

import { SiAutocompleteDirective } from './si-autocomplete.directive';
import { AUTOCOMPLETE_LISTBOX } from './si-autocomplete.model';

@Directive({
  selector: '[siAutocompleteListboxFor]',
  providers: [{ provide: AUTOCOMPLETE_LISTBOX, useExisting: SiAutocompleteListboxDirective }],
  /*host: {
    role: 'listbox',
    '[id]': 'id()'
  },*/
  host: {
    '(click)': 'listboxClick()'
  },
  hostDirectives: [
    {
      directive: Listbox,
      inputs: [
        'id',
        'disabled',
        'orientation',
        'multi',
        'wrap',
        'softDisabled',
        'focusMode',
        'selectionMode',
        'typeaheadDelay',
        'readonly',
        'tabindex',
        'value'
      ],
      outputs: ['valueChange']
    }
  ],
  exportAs: 'siAutocompleteListbox'
})
export class SiAutocompleteListboxDirective<T> implements OnInit {
  /** @defaultValue inject(Listbox) */
  listbox = inject(Listbox);
  private static idCounter = 0;

  /**
   * @defaultValue
   * ```
   * `__si-autocomplete-listbox-${SiAutocompleteListboxDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-autocomplete-listbox-${SiAutocompleteListboxDirective.idCounter++}`);

  readonly autocomplete = input.required<SiAutocompleteDirective<T>>({
    alias: 'siAutocompleteListboxFor'
  });

  readonly siAutocompleteOptionSubmitted = output<T | undefined>();

  /*private keyManager = new ActiveDescendantKeyManager(this.options, this.injector)
    .withWrap(true)
    .withVerticalOrientation(true);*/

  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // For some reason, this is needed sometimes. Otherwise, one may get ExpressionChangedAfterItHasBeenCheckedError.
    queueMicrotask(() => {
      this.changeDetectorRef.markForCheck();
      this.autocomplete().listbox.set(this);
    });
    this.destroyRef.onDestroy(() => {
      this.autocomplete().listbox.set(undefined);
    });
  }

  listboxClick(): void {
    this.autocomplete().expanded.set(false);
    this.autocomplete().value.set(this.listbox.value());
  }
}
