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

/** Color token suffixes that moved from `si.sys.<group>` to `si.sys.color.<group>`. */
export const SYS_COLOR_TOKEN_NAMES = [
  'background-0',
  'background-1',
  'background-2',
  'background-3',
  'background-4',
  'background-accent',
  'background-accent-active',
  'background-accent-hover',
  'background-accent-secondary',
  'background-accent-secondary-active',
  'background-accent-secondary-hover',
  'background-active',
  'background-caution',
  'background-caution-active',
  'background-caution-hover',
  'background-caution-subtle',
  'background-critical',
  'background-critical-active',
  'background-critical-hover',
  'background-critical-subtle',
  'background-danger',
  'background-danger-active',
  'background-danger-hover',
  'background-danger-secondary',
  'background-danger-subtle',
  'background-hover',
  'background-information',
  'background-information-active',
  'background-information-hover',
  'background-information-subtle',
  'background-inverse',
  'background-neutral',
  'background-neutral-active',
  'background-neutral-hover',
  'background-success',
  'background-success-active',
  'background-success-hover',
  'background-success-subtle',
  'background-warning',
  'background-warning-active',
  'background-warning-hover',
  'background-warning-secondary',
  'background-warning-subtle',
  'border-1',
  'border-2',
  'border-3',
  'border-4',
  'border-accent',
  'border-accent-active',
  'border-accent-hover',
  'border-caution',
  'border-critical',
  'border-danger',
  'border-danger-secondary',
  'border-information',
  'border-inverse',
  'border-neutral',
  'border-success',
  'border-warning',
  'border-warning-secondary',
  'code-1',
  'code-2',
  'code-3',
  'code-4',
  'code-5',
  'code-6',
  'code-7',
  'code-8',
  'code-9',
  'code-10',
  'code-11',
  'code-12',
  'data-categorical-1',
  'data-categorical-2',
  'data-categorical-3',
  'data-categorical-4',
  'data-categorical-5',
  'data-categorical-6',
  'data-categorical-7',
  'data-categorical-8',
  'data-categorical-9',
  'data-categorical-10',
  'data-categorical-11',
  'data-categorical-12',
  'data-categorical-13',
  'data-categorical-14',
  'data-categorical-15',
  'data-categorical-16',
  'data-categorical-17',
  'data-rating-average',
  'data-rating-bad',
  'data-rating-excellent',
  'data-rating-good',
  'data-rating-poor',
  'data-sequential-avocado-1',
  'data-sequential-avocado-2',
  'data-sequential-avocado-3',
  'data-sequential-avocado-4',
  'data-sequential-blue-1',
  'data-sequential-blue-2',
  'data-sequential-blue-3',
  'data-sequential-blue-4',
  'data-sequential-deep-blue-1',
  'data-sequential-deep-blue-2',
  'data-sequential-deep-blue-3',
  'data-sequential-deep-blue-4',
  'data-sequential-green-1',
  'data-sequential-green-2',
  'data-sequential-green-3',
  'data-sequential-green-4',
  'data-sequential-interactive-coral-1',
  'data-sequential-interactive-coral-2',
  'data-sequential-interactive-coral-3',
  'data-sequential-interactive-coral-4',
  'data-sequential-orange-1',
  'data-sequential-orange-2',
  'data-sequential-orange-3',
  'data-sequential-orange-4',
  'data-sequential-orchid-1',
  'data-sequential-orchid-2',
  'data-sequential-orchid-3',
  'data-sequential-orchid-4',
  'data-sequential-plum-1',
  'data-sequential-plum-2',
  'data-sequential-plum-3',
  'data-sequential-plum-4',
  'data-sequential-purple-1',
  'data-sequential-purple-2',
  'data-sequential-purple-3',
  'data-sequential-purple-4',
  'data-sequential-red-1',
  'data-sequential-red-2',
  'data-sequential-red-3',
  'data-sequential-red-4',
  'data-sequential-royal-blue-1',
  'data-sequential-royal-blue-2',
  'data-sequential-royal-blue-3',
  'data-sequential-royal-blue-4',
  'data-sequential-sand-1',
  'data-sequential-sand-2',
  'data-sequential-sand-3',
  'data-sequential-sand-4',
  'data-sequential-turquoise-1',
  'data-sequential-turquoise-2',
  'data-sequential-turquoise-3',
  'data-sequential-turquoise-4',
  'data-sequential-yellow-1',
  'data-sequential-yellow-2',
  'data-sequential-yellow-3',
  'data-sequential-yellow-4',
  'effects-backdrop',
  'effects-focus',
  'effects-logo',
  'effects-shadow-1',
  'effects-shadow-2',
  'effects-shadow-3',
  'effects-shadow-4',
  'text-accent',
  'text-accent-active',
  'text-accent-hover',
  'text-caution',
  'text-critical',
  'text-danger',
  'text-disabled',
  'text-information',
  'text-inverse',
  'text-on-accent',
  'text-on-accent-secondary',
  'text-on-accent-secondary-active',
  'text-on-accent-secondary-hover',
  'text-on-caution',
  'text-on-critical',
  'text-on-danger',
  'text-on-danger-secondary',
  'text-on-information',
  'text-on-neutral',
  'text-on-success',
  'text-on-warning',
  'text-on-warning-secondary',
  'text-primary',
  'text-secondary',
  'text-success',
  'text-warning'
] as const;

export const SYS_COLOR_TOKEN_RENAMES: CssCustomPropertyInstruction[] =
  SYS_COLOR_TOKEN_NAMES.flatMap(name => [
    { replace: `$si-sys-${name}`, replaceWith: `$si-sys-color-${name}` },
    { replace: `--si-sys-${name}`, replaceWith: `--si-sys-color-${name}` },
    { replace: `si-sys-${name}`, replaceWith: `si-sys-color-${name}` }
  ]);

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
  },
  {
    replace: '$box-shadow',
    replaceWith: '$si-sys-color-effects-shadow-2'
  },
  {
    replace: '$box-shadow-sm',
    replaceWith: '$si-sys-color-effects-shadow-1'
  },
  {
    replace: '$box-shadow-lg',
    replaceWith: '$si-sys-color-effects-shadow-3'
  },
  {
    replace: '$popover-box-shadow',
    replaceWith: '$si-sys-color-effects-shadow-3'
  },
  {
    replace: '$modal-content-box-shadow-xs',
    replaceWith: '$si-sys-color-effects-shadow-3'
  },
  {
    replace: '$modal-content-box-shadow-sm-up',
    replaceWith: '$si-sys-color-effects-shadow-2'
  },
  {
    replace: '$thumbnail-box-shadow',
    replaceWith: '$si-sys-color-effects-shadow-1'
  },
  {
    replace: '$element-elevation-1',
    replaceWith: '$si-sys-color-effects-shadow-1'
  },
  {
    replace: '$element-elevation-2',
    replaceWith: '$si-sys-color-effects-shadow-2'
  },
  {
    replace: '$element-elevation-3',
    replaceWith: '$si-sys-color-effects-shadow-3'
  },
  {
    replace: '$element-elevation-4',
    replaceWith: '$si-sys-color-effects-shadow-4'
  },
  ...['font-size', 'line-height', 'font-weight'].flatMap(property => [
    {
      replace: `$si-${property}-h1-bold`,
      replaceWith: `$si-${property}-h1`
    },
    {
      replace: `$si-${property}-h4-bold`,
      replaceWith: `$si-${property}-h4`
    },
    {
      replace: `$si-${property}-body-lg-bold`,
      replaceWith: `$si-${property}-body-lg-sbold`
    },
    {
      replace: `$si-${property}-caption`,
      replaceWith: `$si-${property}-body-sm`
    },
    {
      replace: `$si-${property}-display-bold`,
      replaceWith: `$si-${property}-display-lg-sbold`
    }
  ]),
  ...SYS_COLOR_TOKEN_RENAMES
];
