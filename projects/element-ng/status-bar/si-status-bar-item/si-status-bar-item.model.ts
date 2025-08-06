/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ExtendedStatusType } from '@spike-rabbit/element-ng/common';

export interface StatusBarItem {
  /**
   * The value to show. 0 or '' means greyed out
   */
  value: number | string;
  /**
   * A descriptive title
   */
  title: string;
  /**
   * Status of the item. If not specified, specify `color`
   */
  status?: ExtendedStatusType;
  /* DO NOT REMOVE: Even though the input is marked as deprecated, the core-team decided not to remove the
   input. The possibility to have custom color is often requested by projects, so we keep it.
   however in order to discourage it's use, we keep it marked deprecated.
   */
  /**
   * Custom color as CSS value if `status` is not specified
   * @deprecated use the semantic `status` input instead.
   */
  color?: string;
  /**
   * When blinking is enabled, allows to explicitly disable blinking.
   * `undefined` and `true` mean blink.
   */
  blink?: boolean;
  /**
   * Function to call when the item is clicked.
   */
  action?: (item: StatusBarItem) => void;
}
