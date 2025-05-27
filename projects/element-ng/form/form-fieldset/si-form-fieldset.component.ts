/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  HostBinding,
  input,
  signal
} from '@angular/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiFormItemComponent } from '../si-form-item/si-form-item.component';

@Component({
  selector: 'si-form-fieldset',
  imports: [SiTranslateModule],
  templateUrl: './si-form-fieldset.component.html',
  styleUrl: '../si-form.shared.scss',
  host: {
    role: 'group',
    class: 'si-form-input',
    '[style.--si-form-label-width]': 'labelWidth()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFormFieldsetComponent implements DoCheck {
  private static labelIdCounter = 0;

  /** The label for the entire fieldset. */
  readonly label = input.required<string>();

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

  private readonly formItems = signal<SiFormItemComponent[]>([]);

  /** @internal */
  readonly hasOnlyRadios = computed(() => {
    // Check if the fieldset only contains radio buttons.
    // We can safely assume that, if all items have the same control name and if there are at least 2 items.
    const items = this.formItems();
    if (items.length > 1) {
      const first = items[0];
      return items.every(item => item.ngControl()?.name === first.ngControl()?.name);
    }

    return false;
  });

  protected readonly errors = computed(() =>
    // All errors should be the same for radios, so we just take the first.
    this.hasOnlyRadios() ? this.formItems()[0].errors() : []
  );
  protected readonly touched = signal(false);
  protected readonly isRequired = computed(
    () =>
      this.required() || (this.hasOnlyRadios() && this.formItems().every(item => item.required()))
  );

  @HostBinding('attr.aria-labelledby')
  protected labelId = `__si-form-fieldset-label-${SiFormFieldsetComponent.labelIdCounter++}`;

  ngDoCheck(): void {
    this.touched.set(this.formItems().some(item => item.ngControl()?.touched));
  }

  /** @internal */
  registerFormItem(item: SiFormItemComponent): void {
    this.formItems.update(items => [...items, item]);
  }

  /** @internal */
  unregisterFormItem(item: SiFormItemComponent): void {
    this.formItems.update(items => items.filter(i => i !== item));
  }
}
