/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox } from '@angular/aria/combobox';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';

/**
 * Host directive for building custom selects.
 *
 * Add this as a `hostDirective` on your component and expose the inputs/outputs you need.
 * The directive handles:
 * - {@link ControlValueAccessor} integration (`formControl`, `ngModel`, `[(value)]`)
 * - Disabled / readonly state management
 * - Overlay lifecycle for the dropdown (open/close)
 * - Focus management and focus trapping in the dropdown
 * - Opening the dropdown on click, Enter, Space, ArrowDown, ArrowUp
 * - {@link SiFormItemControl} integration
 *
 * Use {@link SiSelectDropdownDirective} to mark the dropdown template in your component,
 * and call {@link open}, {@link close}, {@link updateValue} from your component logic.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-my-select',
 *   hostDirectives: [{
 *     directive: SiCustomSelectDirective,
 *     inputs: ['disabled', 'readonly', 'value'],
 *     outputs: ['valueChange']
 *   }],
 *   template: `
 *     <si-select-combobox>
 *       {{ select.value() }}
 *     </si-select-combobox>
 *     <ng-template si-select-dropdown contentType="listbox">
 *       <button (click)="select.updateValue('new'); select.close()">Pick</button>
 *     </ng-template>
 *   `
 * })
 * export class MySelectComponent {
 *   readonly select = inject(SiCustomSelectDirective);
 * }
 * ```
 *
 * @experimental
 */
@Directive({
  selector: '[siCustomSelect]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: SiCustomSelectDirective, multi: true },
    { provide: SI_FORM_ITEM_CONTROL, useExisting: SiCustomSelectDirective }
  ],
  host: {
    class: 'dropdown',
    '[style.--si-action-icon-offset.rem]': '1.5',
    'aria-autocomplete': 'none',
    '[attr.aria-labelledby]': 'labelledby()',
    '[attr.aria-describedby]': 'errormessageId()',
    '[attr.aria-controls]': 'isOpen() ? dropdownId() : null',
    '[attr.id]': 'id()',
    '[class.disabled]': 'disabled()',
    '[class.pe-none]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()',
    '[class.show]': 'isOpen()'
  }
})
export class SiCustomSelectDirective<T> implements ControlValueAccessor, SiFormItemControl {
  readonly combobox = inject(Combobox);
  private static idCounter = 0;

  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-custom-select-${SiCustomSelectDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-custom-select-${SiCustomSelectDirective.idCounter++}`);

  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Readonly state. Similar to disabled but with higher contrast.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  /**
   * The current value, supports two-way binding via `[(value)]`.
   *
   * @defaultValue undefined
   */
  readonly value = model<T | undefined>(undefined);

  /**
   * Whether the dropdown is currently open.
   *
   * @defaultValue false
   */
  readonly isOpen = computed(() => this.combobox.expanded());

  /** @internal */
  readonly labelledby = computed(() => `${this.id()}-label ${this.id()}-combobox`);

  /** @internal */
  readonly comboboxLabelId = computed(() => `${this.id()}-combobox`);

  /** @internal */
  readonly dropdownId = computed(() => this.id() + '-dropdown');

  /**
   * This ID will be bound to the `aria-describedby` attribute of the select.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  /** Combined disabled state from input and form control. */
  readonly disabled = computed(() => this.disabledInput() || this.disabledByForm());

  private onTouched: () => void = () => {};

  private onChange: (_: T | undefined) => void = () => {};
  private readonly disabledByForm = signal(false);

  constructor() {
    let wasOpen = false;
    effect(() => {
      const isOpen = this.isOpen();
      // Only mark as touched once the user has opened and then closed the
      // dropdown, not on the initial render where it starts closed.
      if (wasOpen && !isOpen) {
        this.onTouched();
      }
      wasOpen = isOpen;
    });
  }

  /**
   * Updates the value programmatically.
   * Call this from your dropdown template to set the new value.
   */
  updateValue(value: T | undefined): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** @internal */
  writeValue(obj: T | null): void {
    this.value.set(obj ?? undefined);
  }

  /** @internal */
  registerOnChange(fn: (_: T | undefined) => void): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
