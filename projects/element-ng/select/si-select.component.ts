/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  output,
  TemplateRef,
  viewChild
} from '@angular/core';
import { defaultConnectedOverlayScrollStrategy } from '@siemens/element-ng/common';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectInputComponent } from './select-input/si-select-input.component';
import { SiSelectListHasFilterComponent } from './select-list/si-select-list-has-filter.component';
import { SiSelectListComponent } from './select-list/si-select-list.component';
import { SiSelectSelectionStrategy } from './selection/si-select-selection-strategy';
import { SiCustomSelectDirective } from './si-custom-select.directive';
import { SiSelectActionsDirective } from './si-select-actions.directive';
import { SiSelectDropdownDirective } from './si-select-dropdown.directive';
import { SiSelectGroupTemplateDirective } from './si-select-group-template.directive';
import { SiSelectOptionTemplateDirective } from './si-select-option-template.directive';
import { SiSelectValueTemplateDirective } from './si-select-value-template.directive';
import { SelectGroup, SelectItem, SelectOption } from './si-select.types';

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
  providers: [
    SiCustomSelectDirective,
    { provide: SI_FORM_ITEM_CONTROL, useExisting: SiSelectComponent }
  ],
  host: {
    class: 'dropdown',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()',
    '[class.si-select-has-filter]': 'hasFilter()'
  }
})
export class SiSelectComponent<T> implements SiFormItemControl {
  private static idCounter = 0;
  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-select-${SiSelectComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-select-${SiSelectComponent.idCounter++}`);
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
  /**
   * Readonly state. Similar to disabled but with higher contrast *
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Optional CDK scroll strategy used for the select overlay.
   *
   * @defaultValue defaultConnectedOverlayScrollStrategy()
   */
  readonly scrollStrategy = input(defaultConnectedOverlayScrollStrategy());

  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  private readonly customSelect = inject(SiCustomSelectDirective);
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

  private readonly trigger = viewChild.required<HTMLElement, ElementRef<HTMLDivElement>>('trigger', {
    read: ElementRef
  });

  /** @internal */
  readonly labelledby = computed(() => this.labelledbyInput() ?? this.id() + '-label');
  /**
   * This ID will be bound to the `aria-describedby` attribute of the select.
   * Use this to reference the element containing the error message(s) for the select.
   * It will be picked by the {@link SiFormItemComponent} if the select is used inside a form item.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  protected rows: readonly SelectItem<T>[] = [];
  protected readonly selectionStrategy = inject(SiSelectSelectionStrategy<T>);

  /**
   * Enables the filter input
   * @defaultValue false
   * @defaultref {@link SiSelectComponent#_hasFilter}
   */
  readonly hasFilter = input(false, { transform: booleanAttribute });

  constructor() {
    this.customSelect.configureOverlay({
      origin: () => this.trigger(),
      panelClass: [],
      focusTrap: false,
      scrollStrategy: () => this.scrollStrategy(),
      offsetX: -1,
      push: false
    });
    this.customSelect.openChange.subscribe(open => this.openChange.emit(open));
  }

  /** Opens the `si-select`. */
  open(): void {
    if (this.readonly() || this.selectionStrategy.disabled()) {
      return;
    }
    this.customSelect.open();
  }

  /** Closes the `si-select`. */
  close(): void {
    this.customSelect.close();
  }
}
