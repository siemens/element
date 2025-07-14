/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/**
 * Empty interface to represent translatable strings before they are translated.
 * Needed so the TypeScript compiler doesn't strip away the {@link TranslatableString} type.
 * Ignored by the documentation.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Translatable {}
/**
 * Represents a translatable string. This can either be a translation key, e.g. `ACTIONS.EDIT` that
 * will be automatically translated when displayed on the UI or a pre-translated string, e.g. `Edit`.
 * Equivalent to a normal string in usage and functionality.
 */
export type TranslatableString = string & Translatable;
