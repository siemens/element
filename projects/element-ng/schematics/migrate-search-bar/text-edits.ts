/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

export interface TextEdit {
  start: number;
  end: number;
  text: string;
}

/** Applies non-overlapping edits. Insertions at the same offset keep their order. */
export const applyTextEdits = (content: string, edits: TextEdit[]): string => {
  const ordered = edits
    .map((edit, index) => ({ edit, index }))
    .sort(
      (left, right) =>
        right.edit.start - left.edit.start ||
        right.edit.end - left.edit.end ||
        right.index - left.index
    )
    .map(({ edit }) => edit);
  let result = content;
  let previousStart = content.length + 1;
  for (const edit of ordered) {
    if (edit.end > previousStart) {
      throw new Error(`Overlapping migration edits at offsets ${edit.start}-${edit.end}.`);
    }
    result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    previousStart = edit.start;
  }
  return result;
};
