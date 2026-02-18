/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  elementBusy,
  elementCancel,
  elementCopy,
  elementCut,
  elementDown2,
  elementDown4,
  elementDownload,
  elementEdit,
  elementFilter,
  elementHide,
  elementJumpToListItem,
  elementLayoutPane3Alt,
  elementLeft2,
  elementLeft4,
  elementLink,
  elementLinkBroken,
  elementMenu,
  elementMinus,
  elementMove,
  elementOk,
  elementOptionsVertical,
  elementOutOfService,
  elementPalette,
  elementPaste,
  elementPin,
  elementPinch,
  elementPlus,
  elementReport,
  elementRight2,
  elementRight4,
  elementShow,
  elementSortUp,
  elementSum,
  elementUp2,
  elementUp4,
  elementZoom
} from '@siemens/element-icons';
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
 *
 * @returns A part that defines icon overrides for the Element AG Grid theme.
 */
export const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  icons: createIconMap({
    aggregation: elementSum,
    arrows: elementMove,
    asc: elementUp4,
    cancel: elementCancel,
    chart: elementReport,
    'chevron-down': elementDown2,
    'chevron-left': elementLeft2,
    'chevron-right': elementRight2,
    'chevron-up': elementUp2,
    'color-picker': elementPalette,
    columns: elementLayoutPane3Alt,
    contracted: elementRight2,
    copy: elementCopy,
    cross: elementCancel,
    cut: elementCut,
    desc: elementDown4,
    edit: elementEdit,
    expanded: elementLeft2,
    'eye-slash': elementHide,
    eye: elementShow,
    filter: elementFilter,
    group: elementJumpToListItem,
    left: elementLeft4,
    linked: elementLink,
    loading: elementBusy,
    maximize: elementZoom,
    menu: elementOptionsVertical,
    'menu-alt': elementOptionsVertical,
    minimize: elementPinch,
    minus: elementMinus,
    next: elementRight2,
    'not-allowed': elementOutOfService,
    paste: elementPaste,
    pin: elementPin,
    plus: elementPlus,
    previous: elementLeft2,
    right: elementRight4,
    save: elementDownload,
    'small-down': elementDown2,
    'small-left': elementLeft2,
    'small-right': elementRight2,
    'small-up': elementUp2,
    tick: elementOk,
    'tree-closed': elementRight2,
    'tree-indeterminate': elementMinus,
    'tree-open': elementDown2,
    unlinked: elementLinkBroken,
    up: elementSortUp,
    grip: elementMenu
  })
});
