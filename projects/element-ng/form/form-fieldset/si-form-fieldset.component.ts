/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiFormFieldsetControl } from './si-form-fieldset.control';

@Component({
  selector: 'si-form-fieldset',
  imports: [SiTranslatePipe],
  templateUrl: './si-form-fieldset.component.html',
  styleUrl: '../si-form.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: 'si-form-input',
    '[style.--si-form-label-width]': 'labelWidth()',
    '[attr.aria-labelledby]': 'labelId'
  }
})
export class SiFormFieldsetComponent {
  private static labelIdCounter = 0;

  /** The label for the entire fieldset. */
  readonly label = input.required<TranslatableString>();

  /** Overrides the parent label width. */
  readonly labelWidth = input<string>();

  /**
   * Adds a required marker to the label
   *
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * Switches all child inputs to inline mode
   *
   * @defaultValue false
   */
  readonly inline = input(false, { transform: booleanAttribute });

  private readonly formItems = signal<SiFormFieldsetControl[]>([]);

  /** @internal */
  readonly hasOnlyRadios = computed(() => {
    // Check if the fieldset only contains radio buttons.
    // We can safely assume that, if all items reference the same control and if there are at least 2 items.
    const items = this.formItems();
    if (items.length > 1) {
      const first = items[0].control();
      return first != null && items.every(item => item.control() === first);
    }

    return false;
  });

  protected readonly errors = computed(() => this.formItems()[0].errors());
  protected readonly touched = computed(() => this.formItems().some(item => item.touched()));
  protected readonly isRequired = computed(
    () =>
      this.required() || (this.hasOnlyRadios() && this.formItems().every(item => item.required()))
  );

  protected readonly labelId = `__si-form-fieldset-label-${SiFormFieldsetComponent.labelIdCounter++}`;

  /** @internal */
  registerControl(item: SiFormFieldsetControl): void {
    this.formItems.update(items => [...items, item]);
  }

  /** @internal */
  unregisterControl(item: SiFormFieldsetControl): void {
    this.formItems.update(items => items.filter(i => i !== item));
  }
}
