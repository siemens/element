/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ImageResolutionLimits {
  // the minimum height of the image in pixels. if not set, the minimum height is not limited.
  minHeight: number;
  // the maximum height of the image in pixels. if not set, the maximum height is not limited.
  maxHeight: number;
  // the minimum width of the image in pixels. if not set, the minimum width is not limited.
  minWidth: number;
  // the maximum width of the image in pixels. if not set, the maximum width is not limited.
  maxWidth: number;
}
