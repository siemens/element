/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** */
export interface IsoLanguageValue {
  /**
   * Official ISO language code, ex "en"
   */
  value: string;
  /**
   * Language name, ex "English" or translatable string, ex "LANGUAGES.EN"
   */
  name: TranslatableString;
}
