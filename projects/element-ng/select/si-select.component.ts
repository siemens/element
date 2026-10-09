/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  TemplateRef,
  viewChild
} from '@angular/core';
import { SI_FORM_ITEM_CONTROL } from '@siemens/element-ng/form';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectInputComponent } from './select-input/si-select-input.component';
import { SiSelectListHasFilterComponent } from './select-list/si-select-list-has-filter.component';
import { SiSelectListComponent } from './select-list/si-select-list.component';
import { SiSelectSelectionStrategy } from './selection/si-select-selection-strategy';
import {
  SI_CUSTOM_SELECT_HOST_IS_TRIGGER,
  SiCustomSelectDirective
} from './si-custom-select.directive';
import { SiSelectActionsDirective } from './si-select-actions.directive';
import { SiSelectDropdownDirective } from './si-select-dropdown.directive';
import { SiSelectGroupTemplateDirective } from './si-select-group-template.directive';
import { SiSelectOptionTemplateDirective } from './si-select-option-template.directive';
import { SiSelectValueTemplateDirective } from './si-select-value-template.directive';
import { SelectGroup, SelectItem, SelectOption } from './si-select.types';

@Component({
  selector: 'si-select',
  imports: [
    CdkOverlayOrigin,
    SiSelectInputComponent,
    SiSelectListComponent,
    SiSelectListHasFilterComponent,
    SiSelectDropdownDirective
  ],
  templateUrl: './si-select.component.html',
  styleUrl: './si-select.component.scss',
  providers: [
    { provide: SI_FORM_ITEM_CONTROL, useExisting: SiSelectComponent },
    { provide: SI_CUSTOM_SELECT_HOST_IS_TRIGGER, useValue: false }
  ],
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
        'siCustomSelectScrollStrategy:scrollStrategy',
        'errormessageId'
      ],
      outputs: ['openChange']
    }
  ]
})
export class SiSelectComponent<T> {
  private readonly customSelect = inject(SiCustomSelectDirective);

  /** Unique identifier. */
  protected readonly id = this.customSelect.id;

  /**
   * Aria label of the select.
   *
   * @defaultValue null
   */
  readonly ariaLabel = input<string | null>(null);
  /**
   * Aria labelledby of the select.
   * @defaultValue undefined
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly labelledbyInput = input<string | undefined>(undefined, { alias: 'labelledby' });
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

  /** Readonly state. Similar to disabled but with higher contrast. */
  protected readonly readonly = this.customSelect.readonly;

  protected readonly isOpen = this.customSelect.isOpen;
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

  private readonly trigger = viewChild.required<CdkOverlayOrigin, ElementRef<HTMLElement>>(
    CdkOverlayOrigin,
    { read: ElementRef }
  );

  /** @internal */
  protected readonly labelledby = computed(
    () => this.labelledbyInput() ?? this.customSelect.id() + '-label'
  );

  /** ID bound to the `aria-describedby` attribute of the select. */
  protected readonly errormessageId = this.customSelect.errormessageId;

  protected rows: readonly SelectItem<T>[] = [];
  protected readonly selectionStrategy = inject(SiSelectSelectionStrategy<T>);

  /**
   * Enables the filter input
   * @defaultValue false
   * @defaultref {@link SiSelectComponent#_hasFilter}
   */
  readonly hasFilter = input(false, { transform: booleanAttribute });

  constructor() {
    afterNextRender(() => {
      this.customSelect.configureOverlayOptions({
        origin: this.trigger(),
        panelClass: [],
        offsetX: -1,
        push: false,
        markTouchedOnClose: false
      });
    });
  }

  /** Opens the `si-select`. */
  open(): void {
    if (this.customSelect.readonly() || this.selectionStrategy.disabled()) {
      return;
    }
    this.customSelect.open();
  }

  /** Closes the `si-select`. */
  close(): void {
    this.customSelect.close();
  }
}
