/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  elementBusy,
  elementDown2,
  elementDownload,
  elementFilter,
  elementLeft2,
  elementLink,
  elementLinkBroken,
  elementMinus,
  elementOk,
  elementOutOfService,
  elementPaste,
  elementPin,
  elementPinch,
  elementPlus,
  elementRight2,
  elementSortUp,
  elementUp2,
  elementZoom
} from '@siemens/element-ng/icon';
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
    aggregation: '',
    arrows: '',
    asc: '',
    cancel: '',
    chart: '',
    'chevron-down': '',
    'chevron-left': '',
    'chevron-right': '',
    'chevron-up': '',
    'color-picker': '',
    'column-arrow': '',
    columns: '',
    contracted: '',
    copy: '',
    cross: '',
    csv: '',
    cut: '',
    desc: '',
    down: elementDown2,
    edit: '',
    excel: '',
    expanded: '',
    'eye-slash': '',
    eye: '',
    filter: elementFilter,
    'filter-add': '',
    first: '',
    group: '',
    last: '',
    left: '',
    linked: elementLink,
    loading: elementBusy,
    maximize: elementZoom,
    menu: '',
    'menu-alt': '',
    minimize: elementPinch,
    minus: '',
    next: '',
    none: '',
    'not-allowed': elementOutOfService,
    paste: elementPaste,
    pin: elementPin,
    'pinned-bottom': '',
    'pinned-top': '',
    pivot: '',
    plus: elementPlus,
    previous: '',
    right: '',
    save: elementDownload,
    'small-down': elementDown2,
    'small-left': elementLeft2,
    'small-right': elementRight2,
    'small-up': elementUp2,
    tick: elementOk,
    'tree-closed': elementRight2,
    'tree-indeterminate': elementMinus,
    'tree-open': elementDown2,
    'un-pin': '',
    unlinked: elementLinkBroken,
    up: elementSortUp,
    grip: '',
    settings: ''
    // star
    //clear
    //gripper
  })
});
