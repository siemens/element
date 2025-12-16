/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { iconOverrides } from 'ag-grid-community';

const createIconMap = (icons: Record<string, string>): Record<string, { svg: string }> =>
  Object.fromEntries(
    Object.entries(icons).map(([key, dataUri]) => [key, { svg: dataUri.split(',')[1] }])
  );

export const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  icons: createIconMap({
    // TODO: Add element icons override as needed
  })
});
