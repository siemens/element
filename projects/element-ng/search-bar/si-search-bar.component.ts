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
  input,
  numberAttribute,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { elementCancel, elementSearch } from '@siemens/element-icons';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { SiSearchBarInputDirective } from './si-search-bar-input.directive';

@Component({
  selector: 'si-search-bar',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-search-bar.component.html',
  styleUrl: './si-search-bar.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSearchBarComponent,
      multi: true
    }
  ],
  host: {
    '[class.readonly]': 'inputReadonly()'
  }
})
export class SiSearchBarComponent implements OnInit, OnDestroy, ControlValueAccessor, OnChanges {
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');
  protected readonly projectedInput = contentChild(SiSearchBarInputDirective);
  private debouncer = new Subject<string>();
  private readonly disabledNgControl = signal(false);

  /**
   * Time unit change of search input takes effect.
   *
   * @deprecated Use a content-projected input and debounce its form value changes in
   * application code, for example with RxJS `debounceTime` on `FormControl.valueChanges`:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput [formControl]="searchControl">
   * </si-search-bar>
   * ```
   * ```typescript
   * searchControl.valueChanges.pipe(debounceTime(400));
   * ```
   *
   * @defaultValue 400
   */
  readonly debounceTime = input(400, { transform: numberAttribute });
  /**
   * Prohibited characters restricting search.
   *
   * @deprecated Use a reactive `FormControl` or Signal Forms on a content-projected input
   * to validate prohibited characters:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput [formControl]="searchControl">
   * </si-search-bar>
   * ```
   * Or with Signal Forms:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput [formField]="searchForm.search">
   * </si-search-bar>
   * ```
   */
  readonly prohibitedCharacters = input<string>();
  /**
   * Define search input placeholder.
   *
   * @deprecated Use a content-projected input with `placeholder` applied directly to it:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput placeholder="Search">
   * </si-search-bar>
   * ```
   *
   * @defaultValue ''
   */
  readonly placeholder = input('');
  /**
   * Display search icon before search input.
   *
   * @defaultValue false
   */
  readonly showIcon = input(false, { transform: booleanAttribute });

  /**
   * Define search input content.
   *
   * @deprecated Use a content-projected input with `value` applied directly to it:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput value="Search term">
   * </si-search-bar>
   * ```
   */
  readonly value = input<string>();

  /**
   * Whether the input can be focused but not edited.
   *
   * @deprecated Use a content-projected input with `readonly` applied directly to it:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput readonly>
   * </si-search-bar>
   * ```
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Color to use for component background
   *
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');

  /**
   * Whether the input is disabled.
   *
   * @deprecated Use a content-projected input with `disabled` applied directly to it:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput disabled>
   * </si-search-bar>
   * ```
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Defines the maximum length of the search input.
   *
   * @deprecated Use a content-projected input with `maxlength` applied directly to it:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput maxlength="100">
   * </si-search-bar>
   * ```
   *
   * @defaultValue undefined
   */
  readonly maxlength = input(undefined, { transform: numberAttribute });

  /**
   * Aria label for the clear button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SEARCH_BAR.CLEAR_BUTTON:Clear`)
   * ```
   */
  readonly clearButtonAriaLabel = input(t(() => $localize`:@@SI_SEARCH_BAR.CLEAR_BUTTON:Clear`));

  /**
   * Output callback event will provide you with search term if search input changes.
   *
   * @deprecated Use a content-projected input and observe `FormControl.valueChanges`
   * or the field value signal with Signal Forms:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput [formControl]="searchControl">
   * </si-search-bar>
   * ```
   * Or with Signal Forms:
   * ```html
   * <si-search-bar>
   *   <input siSearchBarInput [formField]="searchForm.search">
   * </si-search-bar>
   * ```
   */
  readonly searchChange = output<string>();

  protected isInvalid = false;

  protected onChange = (val: any): void => {};
  protected onTouch = (): void => {};

  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());

  protected readonly inputDisabled = computed(
    () => this.projectedInput()?.isDisabled() ?? this.disabled()
  );
  protected readonly inputReadonly = computed(
    () => this.projectedInput()?.readonly() ?? this.readonly()
  );

  protected readonly searchValue = signal('');
  protected readonly icons = addIcons({ elementCancel, elementSearch });

  /** @internal */
  writeValue(value: string): void {
    this.writeSearchValue(value ?? '');
  }

  /** @internal */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /** @internal */
  setDisabledState(disabled: boolean): void {
    this.disabledNgControl.set(disabled);
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.value) {
      this.writeSearchValue(changes.value.currentValue ?? '');
    }
  }

  ngOnInit(): void {
    this.debouncer.pipe(debounceTime(this.debounceTime())).subscribe(value => {
      this.setSearch(value);
    });
  }

  ngOnDestroy(): void {
    this.debouncer.complete();
  }

  private setSearch(value?: string): void {
    value ??= '';
    if (value !== this.searchValue()) {
      this.searchValue.set(value);
      const inputElement = this.getInput();
      if (inputElement) {
        inputElement.value = value;
      }
      this.onChange(value);
      this.searchChange.emit(value);
    }
  }

  private isProhibitedCharactersUsed(searchString: string | null): boolean {
    const prohibitedCharacters = this.prohibitedCharacters();
    if (!prohibitedCharacters || !searchString) {
      return false;
    }

    for (const prohibitedCharacter of prohibitedCharacters) {
      if (searchString.includes(prohibitedCharacter)) {
        return true;
      }
    }

    return false;
  }

  /** @internal */
  focus(): void {
    this.getInput()?.focus();
  }

  protected onCancelFocus(event: Event): void {
    event.stopPropagation();
  }

  /** @internal */
  protected input(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!this.isProhibitedCharactersUsed(value)) {
      if (this.debounceTime() > 0) {
        this.debouncer.next(value);
      } else {
        this.setSearch(value);
      }
    }
  }

  protected onBlur(): void {
    this.onTouch();
  }

  protected resetForm(): void {
    const projectedInput = this.projectedInput();
    if (projectedInput) {
      projectedInput.onReset();
      return;
    }
    this.setSearch('');
    this.focus();
  }

  protected writeSearchValue(value: string): void {
    this.searchValue.set(value);
    const inputElement = this.getInput();
    if (inputElement) {
      inputElement.value = value;
    }
  }

  private getInput(): HTMLInputElement | undefined {
    return this.inputRef()?.nativeElement;
  }
}
