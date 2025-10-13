/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

const BYPASS_PREFIX = '__si-bypass-translation:';
/**
 * Wraps a string as a bypass translation object.
 * This indicates that the string should not be translated.
 *
 * Note: In case test the value of a TranslatableString, you must use
 * the `isBypassTranslation` guard to narrow the type.
 */
export const bypassTranslation = (text: string): TranslatableString => `${BYPASS_PREFIX}${text}`;

/**
 * Checks if the parameter is a bypass translation object.
 */
export const isBypassTranslation = (key: TranslatableString): boolean =>
  typeof key === 'string' && key.startsWith(BYPASS_PREFIX);

/**
 * Extracts the original string from a bypass translation string.
 */
export const getBypassValue = (key: TranslatableString): string =>
  isBypassTranslation(key) ? key.substring(BYPASS_PREFIX.length) : key;
