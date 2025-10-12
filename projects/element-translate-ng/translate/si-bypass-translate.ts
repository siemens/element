/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BypassTranslation, Translatable } from '@siemens/element-translate-ng/translate-types';

/**
 * Wraps a string as a bypass translation object.
 * This indicates that the string should not be translated.
 *
 * Note: In case test the value of a TranslatableString, you must use
 * the `isBypassTranslation` guard to narrow the type.
 */
export const bypassTranslation = (text: string): BypassTranslation => ({
  bypassTranslation: true,
  value: text
});

/**
 * Checks if the parameter is a bypass translation object.
 */
export const isBypassTranslation = (key: unknown): key is BypassTranslation =>
  (key as unknown as BypassTranslation).bypassTranslation === true;

/**
 * Returns the translation key of a Translatable.
 */
export const translationKey = (t: Translatable): string => (isBypassTranslation(t) ? t.value : t);
