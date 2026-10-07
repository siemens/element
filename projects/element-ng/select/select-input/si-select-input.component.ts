/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  output,
  TemplateRef
} from '@angular/core';
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
import {
  SI_SELECT_COMBOBOX_TRIGGER_STATE,
  SiSelectComboboxTriggerDirective,
  SiSelectComboboxTriggerState
} from '../si-select-combobox-trigger.directive';
import { SelectOption } from '../si-select.types';

@Component({
  selector: 'si-select-input',
  imports: [SiAutoCollapsableListModule, SiIconComponent, SiSelectOptionComponent, SiTranslatePipe],
  templateUrl: './si-select-input.component.html',
  styleUrl: './si-select-input.component.scss',
  providers: [
    {
      provide: SI_SELECT_COMBOBOX_TRIGGER_STATE,
      useFactory: () => inject(SiSelectInputComponent).comboboxState
    }
  ],
  host: {
    // In readonly mode, the select needs to be announced as a textbox.
    // Otherwise, screen-reader won't announce the readonly state.
    class: 'select focus-none dropdown-toggle d-flex align-items-center ps-4',
    '[attr.aria-readonly]': 'readonly()',
    '[class.active]': 'open()',
    '(blur)': 'blur()'
  },
  hostDirectives: [SiSelectComboboxTriggerDirective]
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
   * Whether the listbox is open.
   *
   * @defaultValue false
   */
  readonly open = input(false, { transform: booleanAttribute });
  /**
   * Text shown when no option is selected.
   */
  readonly placeholder = input<TranslatableString>();
  /**
   * ID of the associated listbox.
   */
  readonly controls = input.required<string>();
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

  /**
   * Emits when the user requests to open the listbox.
   */
  readonly openListbox = output<void>();
  protected readonly selectionStrategy = inject<SiSelectSelectionStrategy<T>>(
    SiSelectSelectionStrategy<T>
  );
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);
  protected readonly selectedRows = this.selectOptions.selectedRows;
  protected readonly labeledBy = computed(() => `${this.baseId()}-aria-label ${this.labelledby()}`);
  protected readonly icons = addIcons({ elementDown2 });

  /** State exposed to the composed {@link SiSelectComboboxTriggerDirective}. @internal */
  readonly comboboxState: SiSelectComboboxTriggerState = {
    role: computed(() => (this.readonly() ? 'textbox' : 'combobox')),
    haspopup: computed(() => (this.readonly() ? undefined : 'listbox')),
    expanded: computed(() => (this.readonly() ? undefined : this.open())),
    controls: computed(() => (this.readonly() ? undefined : this.controls())),
    labelledby: this.labeledBy,
    disabled: this.selectionStrategy.disabled,
    requestOpen: () => this.click()
  };

  protected blur(): void {
    if (!this.open()) {
      this.selectionStrategy.onTouched();
    }
  }

  protected click(event?: Event): void {
    event?.preventDefault();
    this.openListbox.emit();
  }
}
