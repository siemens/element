/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  contentChild,
  inject,
  input,
  TemplateRef
} from '@angular/core';
import { SiFormItemControl } from '@siemens/element-ng/form';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectInputComponent } from './select-input/si-select-input.component';
import { SiSelectListHasFilterComponent } from './select-list/si-select-list-has-filter.component';
import { SiSelectListComponent } from './select-list/si-select-list.component';
import { SiCustomSelectDirective } from './si-custom-select.directive';
import { SiSelectActionsDirective } from './si-select-actions.directive';
import { SiSelectDropdownDirective } from './si-select-dropdown.directive';
import { SiSelectGroupTemplateDirective } from './si-select-group-template.directive';
import { SiSelectOptionTemplateDirective } from './si-select-option-template.directive';
import { SiSelectValueTemplateDirective } from './si-select-value-template.directive';
import { SelectGroup, SelectOption } from './si-select.types';

@Component({
  selector: 'si-select',
  imports: [
    SiSelectInputComponent,
    SiSelectListComponent,
    SiSelectListHasFilterComponent,
    SiSelectDropdownDirective
  ],
  templateUrl: './si-select.component.html',
  styleUrl: './si-select.component.scss',
  host: {
    '[class.si-select-has-filter]': 'hasFilter()'
  },
  hostDirectives: [
    {
      directive: SiCustomSelectDirective,
      inputs: [
        'id',
        'disabled',
        'readonly',
        'labelledby',
        'siCustomSelectScrollStrategy:scrollStrategy',
        'errormessageId'
      ],
      outputs: ['openChange']
    }
  ]
})
export class SiSelectComponent<T> implements SiFormItemControl {
  protected readonly select = inject(SiCustomSelectDirective);

  /** Unique identifier. */
  readonly id = this.select.id;

  /** ID bound to the select's `aria-describedby` attribute. */
  readonly errormessageId = this.select.errormessageId;

  /** Readonly state. */
  readonly readonly = this.select.readonly;

  /** Scroll strategy used for the select overlay. */
  readonly scrollStrategy = this.select.scrollStrategy;

  /** Emits when the dropdown open state changes. */
  readonly openChange = this.select.openChange;

  /**
   * Aria label of the select.
   *
   * @defaultValue null
   */
  readonly ariaLabel = input<string | null>(null);

  /** Aria labelledby of the select. */
  readonly labelledbyInput = this.select.labelledbyInput;
  /**
   * Placeholder for search input field.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SELECT.SEARCH-PLACEHOLDER:Search…`)
   * ```
   */
  readonly filterPlaceholder = input(t(() => $localize`:@@SI_SELECT.SEARCH-PLACEHOLDER:Search…`));
  /**
   * Label if no item can be found.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SELECT.NO-RESULTS-FOUND:No results found`)
   * ```
   */
  readonly noResultsFoundLabel = input(
    t(() => $localize`:@@SI_SELECT.NO-RESULTS-FOUND:No results found`)
  );
  /** Placeholder text to display when no options are selected. */
  readonly placeholder = input<TranslatableString>();
  protected readonly optionTemplate = contentChild<
    SiSelectOptionTemplateDirective,
    TemplateRef<{ $implicit: SelectOption<T> }>
  >(SiSelectOptionTemplateDirective, { read: TemplateRef });

  protected readonly selectedValueTemplate = contentChild<
    SiSelectValueTemplateDirective,
    TemplateRef<{ $implicit: SelectOption<T> }>
  >(SiSelectValueTemplateDirective, { read: TemplateRef });

  protected readonly groupTemplate = contentChild<
    SiSelectGroupTemplateDirective,
    TemplateRef<{ $implicit: SelectGroup<T> }>
  >(SiSelectGroupTemplateDirective, { read: TemplateRef });

  protected readonly actionsTemplate = contentChild<SiSelectActionsDirective, TemplateRef<any>>(
    SiSelectActionsDirective,
    { read: TemplateRef }
  );

  /** @internal */
  readonly labelledby = this.select.labelledby;

  /**
   * Enables the filter input
   * @defaultValue false
   * @defaultref {@link SiSelectComponent#_hasFilter}
   */
  readonly hasFilter = input(false, { transform: booleanAttribute });

  /** Opens the `si-select`. */
  open(): void {
    this.select.open();
  }

  /** Closes the `si-select`. */
  close(): void {
    this.select.close();
  }
}
