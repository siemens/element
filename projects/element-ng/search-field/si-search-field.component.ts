/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, contentChild, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { elementCancel, elementSearch } from '@siemens/element-icons';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Search input with an icon and clear button for signal forms.
 * Project a native input with Angular's `formField` directive and the search input classes.
 *
 * @example
 * ```html
 * <si-search-field>
 *   <input type="search" class="form-control search-bar-input" aria-label="Search" [formField]="searchField" />
 * </si-search-field>
 * ```
 */
@Component({
  selector: 'si-search-field',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-search-field.component.html',
  styleUrl: './si-search-field.component.scss'
})
export class SiSearchFieldComponent {
  /**
   * Background color variant.
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');

  /**
   * Accessible name of the clear button. Translation keys are supported.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SEARCH_BAR.CLEAR_BUTTON:Clear`)
   * ```
   */
  readonly clearButtonAriaLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_SEARCH_BAR.CLEAR_BUTTON:Clear`)
  );

  private readonly formField = contentChild.required(FormField);
  protected readonly icons = addIcons({ elementCancel, elementSearch });
  private readonly fieldState = computed(() => this.formField().state());
  protected readonly hasValue = computed(() => !!this.fieldState().controlValue());
  protected readonly editable = computed(
    () => !this.fieldState().disabled() && !this.fieldState().readonly()
  );

  protected clear(): void {
    const formField = this.formField();
    const state = formField.state();
    // Clear pending debounced input even when the model is already empty.
    state.controlValue.set('');
    state.value.set('');
    state.markAsDirty();
    formField.focus();
  }
}
