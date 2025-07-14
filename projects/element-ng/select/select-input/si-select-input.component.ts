/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  TemplateRef
} from '@angular/core';
import { SiAutoCollapsableListModule } from '@siemens/element-ng/auto-collapsable-list';
import { addIcons, elementDown2, SiIconNextComponent } from '@siemens/element-ng/icon';
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
  imports: [
    SiAutoCollapsableListModule,
    SiIconNextComponent,
    SiSelectOptionComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-select-input.component.html',
  styleUrl: './si-select-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class: 'select focus-none dropdown-toggle d-flex align-items-center ps-4',
    'aria-autocomplete': 'none',
    'aria-haspopup': 'listbox',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-readonly]': 'readonly()',
    '[attr.aria-controls]': 'controls()',
    '[attr.aria-labelledby]': 'labeledBy()',
    '[attr.aria-disabled]': 'selectionStrategy.disabled()',
    '[attr.tabindex]': 'selectionStrategy.disabled() ? "-1" : "0"',
    '[class.disabled]': 'selectionStrategy.disabled()',
    '[class.active]': 'open()'
  }
})
export class SiSelectInputComponent<T> {
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
  /** @defaultValue false */
  readonly open = input(false, { transform: booleanAttribute });
  readonly placeholder = input<TranslatableString>();
  readonly controls = input.required<string>();
  readonly optionTemplate = input<
    TemplateRef<{
      $implicit: SelectOption<T>;
    }>
  >();

  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  readonly openListbox = output<void>();
  protected readonly selectionStrategy = inject<SiSelectSelectionStrategy<T>>(
    SiSelectSelectionStrategy<T>
  );
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);
  protected readonly selectedRows = this.selectOptions.selectedRows;
  protected readonly labeledBy = computed(() => `${this.baseId()}-aria-label ${this.labelledby()}`);
  protected readonly icons = addIcons({ elementDown2 });

  @HostListener('blur')
  protected blur(): void {
    if (!this.open()) {
      this.selectionStrategy.onTouched();
    }
  }

  @HostListener('click')
  @HostListener('keydown.arrowDown', ['$event'])
  @HostListener('keydown.alt.arrowDown', ['$event'])
  @HostListener('keydown.arrowUp', ['$event'])
  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  protected click(event?: Event): void {
    event?.preventDefault();
    this.openListbox.emit();
  }
}
