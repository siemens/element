/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  BypassTranslation,
  TranslatableString
} from '@siemens/element-translate-ng/translate-types';

/**
 * Wraps a string as a bypass translation object.
 * This indicates that the string should not be translated.
 *
 * Note: In case test the value of a TranslatableString, you must use
 * the `isBypassTranslation` guard to narrow the type.
 */
export const bypassTranslation = (text: string): TranslatableString =>
  ({
    bypassTranslation: true,
    value: text
  }) as unknown as TranslatableString;

/**
 * Checks if the parameter is a bypass translation object.
 */
export const isBypassTranslation = (key: unknown): key is BypassTranslation =>
  (key as unknown as BypassTranslation).bypassTranslation === true;
