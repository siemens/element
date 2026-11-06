/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** A select option group */
export interface SelectGroup<T> {
  /** Defines this to be a group. */
  type: 'group';
  /** An optional key to identify this group in a custom template. */
  key?: string;
  /** A label to be shown as header for this group. Is optional if a custom template is provided. */
  label?: TranslatableString;
  /** All options that are part of this group. */

  options: SelectOption<T>[];
}

/** A select option */
export interface SelectOption<T> {
  /** Defines this to be an option. */
  type: 'option';
  /**
   * The value if this option.
   * It will be used for formControls and the value property of this `si-select`.
   * The value will internally be checked on equality by using `===`.
   * So an app should either use `string` or ensure that same values are referentially equal.
   */
  value: T;
  /** Whether this option is disabled. */
  disabled?: boolean;
  /** An optional icon. */
  icon?: string;
  /** The color of an icon. */
  iconColor?: string;
  /** An optional stacked icon. */
  stackedIcon?: string;
  /** The color of a stacked icon. */
  stackedIconColor?: string;
  /**
   * A label to be shown for this option.
   * Is optional if a custom template is provided or if the value should directly be rendered.
   */
  label?: TranslatableString;
  /**
   * Used for typeahead functionality when filtering is disabled.
   * If provided, this will be used, otherwise the innerText of the rendered element.
   */
  typeaheadLabel?: TranslatableString;
}

/** Alias for {@link SelectOption} or {@link SelectGroup} */
export type SelectItem<T> = SelectGroup<T> | SelectOption<T>;
