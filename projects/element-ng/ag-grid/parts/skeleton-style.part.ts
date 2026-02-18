/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { createPart, type Part } from 'ag-grid-community';

/**
 * Creates a skeleton style part for the Element AG Grid theme.
 * This part applies Element design system shimmer animation to skeleton loading effects
 * to match the Element skeleton component design.
 *
 * @returns A part that defines skeleton loading styles for the Element AG Grid theme.
 */
export const elementSkeletonStyle: Part = createPart({
  css: `
    @keyframes shimmer {
      to {
        background-position-x: -100%;
      }
    }

    .ag-skeleton-effect {
      background: linear-gradient(
        90deg,
        var(--element-base-1-hover) 0%,
        var(--element-base-1-selected) 25%,
        var(--element-base-1-hover) 50%
      );
      background-size: 200% 100%;
      background-position-x: 100%;
      animation: shimmer calc(1.6s * var(--element-animations-enabled, 1)) ease-in-out infinite;
    }
  `
});
