/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox } from '@angular/aria/combobox';
import { booleanAttribute, Component, computed, inject, input, TemplateRef } from '@angular/core';
import { elementDown2 } from '@siemens/element-icons';
import { SiAutoCollapsableListModule } from '@siemens/element-ng/auto-collapsable-list';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import {
  SI_SELECT_OPTIONS_STRATEGY,
  SiSelectOptionsStrategy
} from '../options/si-select-options-strategy';
import { SiSelectOptionComponent } from '../select-option/si-select-option.component';
import { SiSelectSelectionStrategy } from '../selection/si-select-selection-strategy';
import { SelectOption } from '../si-select.types';

@Component({
  selector: 'si-select-input',
  imports: [SiAutoCollapsableListModule, SiIconComponent, SiSelectOptionComponent, SiTranslatePipe],
  templateUrl: './si-select-input.component.html',
  styleUrl: './si-select-input.component.scss',
  host: {
    class: 'select focus-none dropdown-toggle d-flex align-items-center ps-4',
    '[attr.aria-labelledby]': 'labeledBy()',
    '[class.disabled]': 'selectionStrategy.disabled()',
    '(blur)': 'blur()'
  }
})
export class SiSelectInputComponent<T> {
  /**
   * Base ID used to associate the input with its label.
   */
  readonly baseId = input.required<string>();
  /**
   * Aria labelledby of the select.
   *
   * @defaultValue null
   */
  readonly labelledby = input<string | null>(null);
  /**
   * Aria label of the select.
   *
   * @defaultValue null
   */
  readonly ariaLabel = input<string | null>(null);
  /**
   * Text shown when no option is selected.
   */
  readonly placeholder = input<TranslatableString>();
  /**
   * Custom template for rendering selected options.
   */
  readonly optionTemplate = input<
    TemplateRef<{
      $implicit: SelectOption<T>;
    }>
  >();

  /**
   * Whether the input is read-only.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  protected readonly selectionStrategy = inject<SiSelectSelectionStrategy<T>>(
    SiSelectSelectionStrategy<T>
  );
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);
  protected readonly selectedRows = this.selectOptions.selectedRows;
  protected readonly labeledBy = computed(() => `${this.baseId()}-aria-label ${this.labelledby()}`);
  protected readonly icons = addIcons({ elementDown2 });

  private readonly ngCombobox = inject(Combobox);

  protected blur(): void {
    if (!this.ngCombobox.expanded()) {
      this.selectionStrategy.onTouched();
    }
  }
}
