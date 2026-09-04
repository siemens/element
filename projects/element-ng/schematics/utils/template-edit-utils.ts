/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import type { Attribute, Element } from '@angular/compiler';

export const formatBoundAttribute = (name: string, expression: string): string => {
  const quote = expression.includes('"') && !expression.includes("'") ? "'" : '"';
  const escapedExpression =
    quote === '"' ? expression.replaceAll('"', '&quot;') : expression.replaceAll("'", '&#39;');
  return `[${name}]=${quote}${escapedExpression}${quote}`;
};

export const replaceAttribute = (
  attribute: Pick<Attribute, 'sourceSpan'>,
  replacement: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const start = attribute.sourceSpan.start.offset + offset;
  recorder.remove(start, attribute.sourceSpan.end.offset - attribute.sourceSpan.start.offset);
  recorder.insertLeft(start, replacement);
};

export const insertAttribute = (
  template: string,
  element: Element,
  attribute: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const selfClosing = element.startSourceSpan.toString().endsWith('/>');
  const insertOffset = element.startSourceSpan.end.offset - (selfClosing ? 2 : 1);
  const prefix = /\s/.test(template[insertOffset - 1] ?? '') ? '' : ' ';
  recorder.insertLeft(insertOffset + offset, `${prefix}${attribute}${selfClosing ? ' ' : ''}`);
};

export const removeAttribute = (
  template: string,
  attribute: Pick<Attribute, 'sourceSpan'>,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const start = attribute.sourceSpan.start.offset;
  const end = attribute.sourceSpan.end.offset;
  const lineStart = template.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = template.indexOf('\n', end);
  const endOfLine = lineEnd === -1 ? template.length : lineEnd;

  if (
    template.slice(lineStart, start).trim() === '' &&
    template.slice(end, endOfLine).trim() === ''
  ) {
    const removeEnd = lineEnd === -1 ? endOfLine : lineEnd + 1;
    recorder.remove(lineStart + offset, removeEnd - lineStart);
    return;
  }

  const removeStart = start > 0 && /\s/.test(template[start - 1] ?? '') ? start - 1 : start;
  recorder.remove(removeStart + offset, end - removeStart);
};
