/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface CssCustomPropertyInstruction {
  /** The CSS custom property to replace. */
  replace: string;
  /** The new CSS custom property name. */
  replaceWith: string;
}

export const CSS_CUSTOM_PROPERTIES_MIGRATION: CssCustomPropertyInstruction[] = [
  {
    replace: '--si-feedback-icon-offset',
    replaceWith: '--si-feedback-icon-size'
  },
  {
    replace: '--element-base-input-experimental',
    replaceWith: '--element-base-input'
  },
  {
    replace: '$element-base-input-experimental',
    replaceWith: '$element-base-input'
  },
  {
    replace: '$si-font-size-h1-black',
    replaceWith: '$si-font-size-h1-bold'
  },
  {
    replace: '$si-font-size-title-1-bold',
    replaceWith: '$si-font-size-h4-bold'
  },
  {
    replace: '$si-font-size-title-1',
    replaceWith: '$si-font-size-h4'
  },
  {
    replace: '$si-font-size-title-2-bold',
    replaceWith: '$si-font-size-h5-bold'
  },
  {
    replace: '$si-font-size-title-2',
    replaceWith: '$si-font-size-h5'
  },
  {
    replace: '$si-font-size-body-1',
    replaceWith: '$si-font-size-body-lg'
  },
  {
    replace: '$si-font-size-body-2',
    replaceWith: '$si-font-size-body'
  },
  {
    replace: '$si-font-size-caption-1',
    replaceWith: '$si-font-size-caption'
  },
  {
    replace: '$si-font-size-display-1',
    replaceWith: '$si-font-size-display-xl'
  },
  {
    replace: '$si-font-size-display-2',
    replaceWith: '$si-font-size-display-lg'
  },
  {
    replace: '$si-font-size-display-3',
    replaceWith: '$si-font-size-display-bold'
  },
  {
    replace: '$si-font-size-display-4',
    replaceWith: '$si-font-size-display'
  },
  {
    replace: '$si-line-height-h1-black',
    replaceWith: '$si-line-height-h1-bold'
  },
  {
    replace: '$si-line-height-title-1-bold',
    replaceWith: '$si-line-height-h4-bold'
  },
  {
    replace: '$si-line-height-title-1',
    replaceWith: '$si-line-height-h4'
  },
  {
    replace: '$si-line-height-title-2-bold',
    replaceWith: '$si-line-height-h5-bold'
  },
  {
    replace: '$si-line-height-title-2',
    replaceWith: '$si-line-height-h5'
  },
  {
    replace: '$si-line-height-body-1',
    replaceWith: '$si-line-height-body-lg'
  },
  {
    replace: '$si-line-height-body-2',
    replaceWith: '$si-line-height-body'
  },
  {
    replace: '$si-line-height-caption-1',
    replaceWith: '$si-line-height-caption'
  },
  {
    replace: '$si-line-height-display-1',
    replaceWith: '$si-line-height-display-xl'
  },
  {
    replace: '$si-line-height-display-2',
    replaceWith: '$si-line-height-display-lg'
  },
  {
    replace: '$si-line-height-display-3',
    replaceWith: '$si-line-height-display-bold'
  },
  {
    replace: '$si-line-height-display-4',
    replaceWith: '$si-line-height-display'
  },
  {
    replace: '$si-font-weight-h1-black',
    replaceWith: '$si-font-weight-h1-bold'
  },
  {
    replace: '$si-font-weight-title-1-bold',
    replaceWith: '$si-font-weight-h4-bold'
  },
  {
    replace: '$si-font-weight-title-1',
    replaceWith: '$si-font-weight-h4'
  },
  {
    replace: '$si-font-weight-title-2-bold',
    replaceWith: '$si-font-weight-h5-bold'
  },
  {
    replace: '$si-font-weight-title-2',
    replaceWith: '$si-font-weight-h5'
  },
  {
    replace: '$si-font-weight-body-1',
    replaceWith: '$si-font-weight-body-lg'
  },
  {
    replace: '$si-font-weight-body-2',
    replaceWith: '$si-font-weight-body'
  },
  {
    replace: '$si-font-weight-caption-1',
    replaceWith: '$si-font-weight-caption'
  },
  {
    replace: '$si-font-weight-display-1',
    replaceWith: '$si-font-weight-display-xl'
  },
  {
    replace: '$si-font-weight-display-2',
    replaceWith: '$si-font-weight-display-lg'
  },
  {
    replace: '$si-font-weight-display-3',
    replaceWith: '$si-font-weight-display-bold'
  },
  {
    replace: '$si-font-weight-display-4',
    replaceWith: '$si-font-weight-display'
  }
];
