/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/** Locale-independent ordering so prepared artifacts are identical on every machine. */
export const compareText = new Intl.Collator('en').compare;
