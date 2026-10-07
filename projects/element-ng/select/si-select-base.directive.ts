/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Directive, input, output, signal } from '@angular/core';
import { defaultConnectedOverlayScrollStrategy } from '@siemens/element-ng/common';

/**
 * Shared host directive providing the common inputs, output, open state and
 * host bindings used by select-like controls such as {@link SiSelectComponent}
 * and {@link SiCustomSelectDirective}.
 *
 * It is meant to be composed via `hostDirectives`, not applied directly.
 *
 * @internal
 */
@Directive({
  host: {
    class: 'dropdown',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()'
  }
})
export class SiSelectBaseDirective {
  private static idCounter = 0;

  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-select-${SiSelectBaseDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-select-${SiSelectBaseDirective.idCounter++}`);

  /**
   * Readonly state. Similar to disabled but with higher contrast.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Optional CDK scroll strategy used for the overlay.
   *
   * @defaultValue defaultConnectedOverlayScrollStrategy()
   */
  readonly scrollStrategy = input(defaultConnectedOverlayScrollStrategy());

  /**
   * This ID will be bound to the `aria-describedby` attribute of the select.
   * Use this to reference the element containing the error message(s).
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  /**
   * Whether the dropdown is currently open.
   *
   * @defaultValue false
   */
  readonly isOpen = signal(false);
}
