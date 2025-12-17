/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { iconOverrides } from 'ag-grid-community';

/**
 * Utility function to convert data URI icon map to AG Grid icon format.
 * Extracts base64 SVG data from data URIs.
 *
 * @param icons - Record of icon names to data URI strings
 * @returns Record of icon names to AG Grid icon objects with SVG data
 */
const createIconMap = (icons: Record<string, string>): Record<string, { svg: string }> =>
  Object.fromEntries(
    Object.entries(icons).map(([key, dataUri]) => [key, { svg: dataUri.split(',')[1] }])
  );

/**
 * Creates an icon overrides part for the Element AG Grid theme.
 * This part allows customization of AG Grid icons with Element design system icons.
 * Icons can be added to the icons map as needed.
 */
export const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  icons: createIconMap({
    // TODO: Add element icons override as needed
  })
});
