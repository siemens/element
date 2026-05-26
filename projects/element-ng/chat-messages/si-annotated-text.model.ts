/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/** A single source citation referenced within an AI message. */
export interface SiChatCitation {
  /** Unique identifier used to match citation segments to this citation. */
  id: string;
  /** Human-readable title of the source (e.g. page title or document name). */
  title: string;
  /** Optional URL to the original source. */
  url?: string;
  /** Optional short snippet showing the exact passage or section the AI used. */
  description?: string;
}

/** A plain-text run within an annotated message. */
export interface SiChatTextRun {
  type: 'text';
  content: string;
}

/** A citation placeholder within an annotated message that maps to a {@link SiChatCitation}. */
export interface SiChatCitationRun {
  type: 'citation';
  citationId: string;
}

export type SiChatTextSegment = SiChatTextRun | SiChatCitationRun;

/**
 * Normalized representation of an AI message that contains inline citations.
 *
 * Produced by helper functions such as `parseCitationMarkers` or
 * `parseCitationOffsets` and consumed by {@link SiAiMessageComponent} via its
 * `annotatedText` input.
 */
export interface SiChatAnnotatedText {
  /** Ordered segments that make up the full message content. */
  segments: SiChatTextSegment[];
  /** All citations referenced by the segments. */
  citations: SiChatCitation[];
}
