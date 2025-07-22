/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  DestroyRef,
  Directive,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  QueryList,
  SimpleChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class SiAutocompleteListboxDirective<T> implements OnInit, OnChanges, AfterContentInit {
  private static idCounter = 0;

  @ContentChildren(SiAutocompleteOptionDirective, { descendants: true })
  private options!: QueryList<SiAutocompleteOptionDirective<T>>;

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

  private keyManager?: ActiveDescendantKeyManager<SiAutocompleteOptionDirective<T>>;

  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.siAutocompleteDefaultIndex) {
      if (!this.keyManager?.activeItem) {
        this.setActiveItem();
      }
    }
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

  ngAfterContentInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options)
      .withWrap(true)
      .withVerticalOrientation(true);

    this.options.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setActiveItem());

    this.setActiveItem();
  }

  private setActiveItem(): void {
    queueMicrotask(() => {
      this.keyManager!.setActiveItem(this.siAutocompleteDefaultIndex());
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
    return this.keyManager?.activeItem ?? null;
  }
}
