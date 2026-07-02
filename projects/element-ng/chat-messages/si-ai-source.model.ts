/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Represents a single cited source attached to an AI message.
 *
 * @experimental
 */
export interface SiAiSource {
  /** Display name of the source document, page, or article. */
  title: string;
  /** Short excerpt from the source that the AI used. */
  excerpt: string;
  /** URL to the source. Opened in a new tab when the user clicks the source row. */
  url: string;
}
