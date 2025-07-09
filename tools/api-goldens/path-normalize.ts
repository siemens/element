/* eslint-disable headers/header-format, tsdoc/syntax, prefer-arrow/prefer-arrow-functions */
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { normalize } from 'path';

/** Normalizes a path to use Posix forward-slash separators. */
export function normalizePathToPosix(input: string): string {
  return normalize(input).replace(/\\/g, '/');
}
