/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  input,
  OnInit,
  output,
  contentChildren,
  INJECTOR,
  effect
} from '@angular/core';

import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';
import { SiAutocompleteDirective } from './si-autocomplete.directive';
import { AUTOCOMPLETE_LISTBOX } from './si-autocomplete.model';

@Directive({
  selector: '[siAutocompleteListboxFor]',
  providers: [{ provide: AUTOCOMPLETE_LISTBOX, useExisting: SiAutocompleteListboxDirective }],
  host: {
    role: 'listbox',
    '[id]': 'id()'
  },
  exportAs: 'siAutocompleteListbox'
})
export class SiAutocompleteListboxDirective<T> implements OnInit {
  private static idCounter = 0;

  private readonly options = contentChildren(SiAutocompleteOptionDirective, { descendants: true });

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

  /** @defaultValue 0 */
  readonly siAutocompleteDefaultIndex = input(0);

  readonly siAutocompleteOptionSubmitted = output<T | undefined>();

  private injector = inject(INJECTOR);
  private keyManager = new ActiveDescendantKeyManager(this.options, this.injector)
    .withWrap(true)
    .withVerticalOrientation(true);

  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.siAutocompleteDefaultIndex() >= 0 && !this.keyManager.activeItem) {
        this.setActiveItem();
      }
    });

    effect(() => {
      if (this.options()) {
        this.setActiveItem();
      }
    });
  }

  ngOnInit(): void {
    // For some reason, this is needed sometimes. Otherwise, one may get ExpressionChangedAfterItHasBeenCheckedError.
    queueMicrotask(() => {
      this.changeDetectorRef.markForCheck();
      this.autocomplete().listbox = this;
    });
    this.destroyRef.onDestroy(() => {
      this.autocomplete().listbox = undefined;
    });
  }

  private setActiveItem(): void {
    queueMicrotask(() => {
      this.keyManager.setActiveItem(this.siAutocompleteDefaultIndex());
      this.changeDetectorRef.markForCheck();
    });
  }

  /** @internal */
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      // [ctrl + enter] should submit and not select an option.
      // Mainly needed for filtered-search.
      return;
    }
    this.keyManager!.onKeydown(event);
    if (event.key === 'Enter' && this.keyManager!.activeItem) {
      this.siAutocompleteOptionSubmitted.emit(this.keyManager!.activeItem.value());
      // Something was selected. This should prevent everything else from happening, especially submitting the form.
      event.stopImmediatePropagation();
    }
    this.changeDetectorRef.markForCheck();
  }

  get active(): SiAutocompleteOptionDirective<T> | null {
    // NOTE: We must not return `this.keyManager.activeItem` here, because its not updating
    // activeItem reference when options change.
    if (this.keyManager.activeItemIndex === null) {
      return null;
    }
    return this.options().at(this.keyManager.activeItemIndex) ?? null;
  }
}
