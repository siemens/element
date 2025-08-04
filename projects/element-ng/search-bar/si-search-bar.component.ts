/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
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
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import {
  elementCancel,
  elementSearch,
  addIcons,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'si-search-bar',
  imports: [SiIconNextComponent],
  templateUrl: './si-search-bar.component.html',
  styleUrl: './si-search-bar.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSearchBarComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.readonly]': 'readonly()'
  }
})
export class SiSearchBarComponent implements OnInit, OnDestroy, ControlValueAccessor, OnChanges {
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');
  private debouncer = new Subject<string>();
  private readonly disabledNgControl = signal(false);

  /**
   * Time unit change of search input takes effect.
   *
   * @defaultValue 400
   */
  readonly debounceTime = input(400, { transform: numberAttribute });
  /**
   * Prohibited characters restricting search.
   */
  readonly prohibitedCharacters = input<string>();
  /**
   * Define search input placeholder.
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
   * Whether the search is tabbable or not.
   *
   * @defaultValue true
   */
  readonly tabbable = input(true, { transform: booleanAttribute });

  /**
   * Define search input content.
   */
  readonly value = input<string>();

  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Color to use for component background
   *
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');

  /** @defaultValue false */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Output callback event will provide you with search term if search input changes.
   */
  readonly searchChange = output<string>();

  protected isInvalid = false;
  protected inFocus = false;

  protected onChange = (val: any): void => {};
  protected onTouch = (): void => {};

  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());

  protected readonly searchValue = signal('');
  protected readonly icons = addIcons({ elementCancel, elementSearch });

  /** @internal */
  writeValue(value: string): void {
    this.setSearch(value);
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.setSearch(changes.value.currentValue);
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
    if (value !== this.searchValue()) {
      // FIXME: in v48, move outside the `if` so we don't emit when `value === undefined`
      const searchVal = value ?? '';
      this.searchValue.set(searchVal);
      this.inputRef().nativeElement.value = searchVal;
      this.onChange(searchVal);
      this.searchChange.emit(searchVal);
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
  @HostListener('focus')
  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  protected onCancelFocus(event: Event): void {
    event.stopPropagation();
  }

  protected input(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!this.isProhibitedCharactersUsed(value)) {
      this.debouncer.next(value);
    }
  }

  protected onBlur(): void {
    this.inFocus = false;
    this.onTouch();
  }

  protected resetForm(): void {
    this.setSearch('');
  }
}
