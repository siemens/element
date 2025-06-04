/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 *
 * @deprecated Use {@link SelectOption} instead.
 */
export interface SelectOptionLegacy {
  /** Defines this to be the deprecated option. */
  type?: undefined;
  /** Identifies the option, will be used as `value` for the component */
  id: string;
  /** Title to display */
  title: string;
  /** Optional icon to display */
  icon?: string;
  /** Optional color class for the icon */
  color?: string;
  /** Is the option disabled? */
  disabled?: boolean;
}

/** A select option group */
export interface SelectGroup<T> {
  /** Defines this to be a group. */
  type: 'group';
  /** An optional key to identify this group in a custom template. */
  key?: string;
  /** A label to be shown as header for this group. Is optional if a custom template is provided. */
  label?: string;
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
  /**
   * A label to be shown for this option.
   * Is optional if a custom template is provided or if the value should directly be rendered.
   */
  label?: string;
  /**
   * Used for typeahead functionality when filtering is disabled.
   * If provided, this will be used, otherwise the innerText of the rendered element.
   */
  typeaheadLabel?: string;
}

/** Alias for {@link SelectOption} or {@link SelectGroup} */
export type SelectItem<T> = SelectGroup<T> | SelectOption<T>;
