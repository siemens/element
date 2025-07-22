/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild
} from '@angular/core';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectComplexOptionsDirective } from './options/si-select-complex-options.directive';
import { SI_SELECT_OPTIONS_STRATEGY } from './options/si-select-options-strategy';
import { SiSelectInputComponent } from './select-input/si-select-input.component';
import { SiSelectListHasFilterComponent } from './select-list/si-select-list-has-filter.component';
import { SiSelectListComponent } from './select-list/si-select-list.component';
import { SiSelectSelectionStrategy } from './selection/si-select-selection-strategy';
import { SiSelectActionsDirective } from './si-select-actions.directive';
import { SiSelectGroupTemplateDirective } from './si-select-group-template.directive';
import { SiSelectOptionTemplateDirective } from './si-select-option-template.directive';
import { SelectGroup, SelectItem, SelectOption } from './si-select.types';

@Component({
  selector: 'si-select',
  imports: [
    OverlayModule,
    SiSelectInputComponent,
    SiSelectListComponent,
    SiSelectListHasFilterComponent
  ],
  templateUrl: './si-select.component.html',
  styleUrl: './si-select.component.scss',
  providers: [{ provide: SI_FORM_ITEM_CONTROL, useExisting: SiSelectComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dropdown',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()',
    '[class.si-select-has-filter]': 'hasFilter()'
  }
})
export class SiSelectComponent<T> implements OnChanges, AfterContentInit, SiFormItemControl {
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
   * $localize`:@@SI_SELECT.SEARCH-PLACEHOLDER:Search...`
   * ```
   */
  readonly filterPlaceholder = input($localize`:@@SI_SELECT.SEARCH-PLACEHOLDER:Search...`);
  /**
   * Label if no item can be found.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_SELECT.NO-RESULTS-FOUND:No results found`
   * ```
   */
  readonly noResultsFoundLabel = input($localize`:@@SI_SELECT.NO-RESULTS-FOUND:No results found`);
  /** Placeholder text to display when no options are selected. */
  readonly placeholder = input<TranslatableString>();
  /**
   * Readonly state. Similar to disabled but with higher contrast *
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Emits on selection dropdown close.
   * @deprecated Use {@link openChange} instead.
   */
  readonly dropdownClose = output<void>();
  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  protected readonly isOpen = signal(false);

  protected readonly optionTemplate = contentChild<
    SiSelectOptionTemplateDirective,
    TemplateRef<{ $implicit: SelectOption<T> }>
  >(SiSelectOptionTemplateDirective, { read: TemplateRef });

  protected readonly groupTemplate = contentChild<
    SiSelectGroupTemplateDirective,
    TemplateRef<{ $implicit: SelectGroup<T> }>
  >(SiSelectGroupTemplateDirective, { read: TemplateRef });

  protected readonly actionsTemplate = contentChild<SiSelectActionsDirective, TemplateRef<any>>(
    SiSelectActionsDirective,
    { read: TemplateRef }
  );

  private readonly trigger = viewChild.required<CdkOverlayOrigin, ElementRef<HTMLDivElement>>(
    CdkOverlayOrigin,
    {
      read: ElementRef
    }
  );

  /** @internal */
  readonly labelledby = computed(() => this.labelledbyInput() ?? this.id() + '-label');
  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  protected rows: readonly SelectItem<T>[] = [];
  protected overlayWidth = 0;
  protected readonly selectionStrategy = inject(SiSelectSelectionStrategy<T>);

  private backdropClicked = false;
  private readonly selectOptions = inject(SI_SELECT_OPTIONS_STRATEGY);

  /**
   * Enables the filter input
   * @defaultValue false
   * @defaultref {@link SiSelectComponent#_hasFilter}
   */
  readonly hasFilter = input(false, { transform: booleanAttribute });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasFilter && this.hasFilter()) {
      this.verifyValueProvider();
    }
  }

  ngAfterContentInit(): void {
    this.verifyValueProvider();
  }

  /** Opens the `si-select`. */
  open(): void {
    if (this.readonly() || this.selectionStrategy.disabled()) {
      return;
    }
    this.overlayWidth = this.trigger().nativeElement.getBoundingClientRect().width + 2; // 2px border
    this.isOpen.set(true);
    this.openChange.emit(true);
  }

  /** Closes the `si-select`. */
  close(): void {
    this.isOpen.set(false);
    if (!this.backdropClicked) {
      this.trigger().nativeElement.focus();
    } else {
      this.backdropClicked = false;
      this.selectionStrategy.onTouched();
    }
    this.dropdownClose.emit();
    this.openChange.emit(false);
  }

  protected backdropClick(): void {
    this.backdropClicked = true;
    this.isOpen.set(false);
  }

  private verifyValueProvider(): void {
    if (
      this.hasFilter() &&
      this.optionTemplate() &&
      this.selectOptions instanceof SiSelectComplexOptionsDirective &&
      !this.selectOptions.valueProvider()
    ) {
      console.error(
        'A valueProvider is required when [hasFilter]="true" and having custom option template on si-select'
      );
    }
  }
}
