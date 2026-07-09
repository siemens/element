/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

/**
 * Function type used to render markdown content to a DOM node.
 *
 * @experimental
 */
export type MarkdownRenderer = (text: string) => Node;

const defaultMarkdownRenderer: MarkdownRenderer = (text: string): Node => {
  const div = document.createElement('div');
  div.textContent = text;
  div.className = 'markdown-content text-break';
  return div;
};

/**
 * Injection token for chat message markdown rendering.
 *
 * Consumers can provide their own implementation to enable markdown parsing.
 * The default implementation renders plain text inside an element with markdown classes.
 *
 * @experimental
 */
export const MARKDOWN_RENDERER = new InjectionToken<MarkdownRenderer>('markdown.renderer', {
  providedIn: 'root',
  factory: () => defaultMarkdownRenderer
});
