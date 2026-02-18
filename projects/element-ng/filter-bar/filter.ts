/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * @deprecated FilterStatusType has been deprecated as it no longer has any visual effect on filter pills.
 * This type will be removed in the next major version. Please remove any usage of the `status` property
 * from your Filter objects as it is now ignored by the component.
 */
export type FilterStatusType = 'default' | 'success' | 'info' | 'warning' | 'danger' | 'inactive';

export interface Filter {
  /**
   * Identification name of filter pill.
   * Is not shown to the user, please specify either a {@link title} or a {@link description}.
   */
  filterName: string;
  /**
   * Shown title of filter pill.
   * Can be left empty if {@link description} is used.
   */
  title?: TranslatableString;
  /**
   * Short description of filter pill.
   * Can be left empty if {@link title} is used to align the title to middle of pill.
   */
  description?: TranslatableString;
  /**
   * @deprecated The status property has been deprecated as it no longer has any visual effect on filter pills.
   * This property will be removed in the next major version. Please remove this property from your Filter
   * objects as it is now ignored by the filter component.
   */
  status?: FilterStatusType;
}
