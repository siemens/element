/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/** Metadata describing a source. */
export interface SiSource {
  /** Source name displayed to the user. */
  name: string;
  /** Source URL. */
  url: string;
  /** Optional source description. */
  description?: string;
  /** Optional source quote. Takes precedence over {@link description}. */
  quote?: string;
}