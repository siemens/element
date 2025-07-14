/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ThemeDescription {
  name: string;
  groups: ThemePropertyGroup[];
}

export interface ThemePropertyGroup {
  name: string;
  description?: string;
  properties: ThemeProperty[];
}

export interface ThemeProperty {
  name: string;
  usage: string;
  type: ThemePropertyType;
}

export type ThemePropertyType = 'color' | 'gradient' | 'font' | 'url' | 'text' | 'number';

export interface Theme {
  name: string;
  schemes: ThemeColorSchemes;
  /**
   * A map of icons that overrides the default Element icons.
   * The key must be the key of the original icon that should be overridden.
   * The value has to be a data SVG string.
   *
   * @example
   * ```ts
   * {
   *   elementUser: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>...</svg>"
   * }
   * ```
   *
   * @experimental
   */
  icons?: Record<string, string>;
}

export interface ThemeColorSchemes {
  light?: ThemeColorScheme;
  dark?: ThemeColorScheme;
}

export type ThemeColorScheme = { [key: string]: string };

export type ThemeType = 'dark' | 'light' | 'auto';

export const ELEMENT_THEME_NAME = 'element';

export const elementTheme: ThemeDescription = {
  name: 'element',
  groups: [
    {
      name: 'Branding',
      description: 'Configure the brand logo.',
      properties: [
        {
          name: '--element-brand-logo',
          usage: 'Enter a brand logo in the format: \'url("https://company/logo.svg")\'',
          type: 'text'
        },
        {
          name: '--element-brand-logo-width',
          usage: "Enter the width of the logo as CSS width value. Example: '100px'",
          type: 'text'
        },
        {
          name: '--element-brand-logo-height',
          usage: "Enter the height of the logo as CSS width value. Max: 48px; Example: '16px'",
          type: 'text'
        },
        {
          name: '--element-brand-logo-text',
          usage:
            'Enter a textual representation of the logo. Example: \'"Siemens logo"\'. The text must be wrapped in double quotes.',
          type: 'text'
        }
      ]
    },
    {
      name: 'Basic definitions',
      description: 'Basic definitions',
      properties: [
        {
          name: '--element-body-font-family',
          usage: 'The theme only uses one font everywhere.',
          type: 'font'
        },
        { name: '--element-button-radius', usage: 'Button border radius', type: 'text' },
        { name: '--element-button-focus-width', usage: 'Focus width', type: 'text' },
        {
          name: '--element-button-focus-overlay-width',
          usage: 'Focus overlay width',
          type: 'text'
        },
        {
          name: '--element-button-focus-overlay-color',
          usage: 'Focus overlay color',
          type: 'text'
        },
        { name: '--element-input-radius', usage: 'Input field border radius', type: 'text' },
        { name: '--element-logo-color', usage: 'Logo color', type: 'text' },
        { name: '--element-radius-1', usage: 'Border radius-1', type: 'text' },
        { name: '--element-radius-2', usage: 'Border radius-2', type: 'text' },
        { name: '--element-radius-3', usage: 'Border radius-3', type: 'text' }
      ]
    },
    {
      name: 'UI',
      description:
        'UI colors are used on structural properties and icons and provide good contrast when used over any background.',
      properties: [
        { name: '--element-ui-0', usage: 'Logo, selected (active) elements', type: 'color' },
        { name: '--element-ui-0-hover', usage: 'Selected hover', type: 'color' },
        { name: '--element-ui-1', usage: 'Primary icons', type: 'color' },
        { name: '--element-ui-2', usage: 'Secondary icons', type: 'color' },
        { name: '--element-ui-3', usage: 'Disabled', type: 'color' },
        { name: '--element-ui-4', usage: 'Borders', type: 'color' },
        { name: '--element-ui-5', usage: 'Inverse', type: 'color' },
        { name: '--element-ui-6', usage: 'Shadows', type: 'color' },
        { name: '--element-box-shadow-color-1', usage: 'Box shadow color 1', type: 'color' },
        { name: '--element-box-shadow-color-2', usage: 'Box shadow color 2', type: 'color' },
        { name: '--element-focus-default', usage: 'Default focus color', type: 'color' }
      ]
    },
    {
      name: 'Base',
      description: 'Base colors are used as backgrounds of containers.',
      properties: [
        { name: '--element-base-0', usage: 'Page background, row background', type: 'color' },
        {
          name: '--element-base-1',
          usage: 'Header, navigation, card, table background',
          type: 'color'
        },
        {
          name: '--element-base-1-hover',
          usage: 'Hover on base-1 backgrounds, like table, tree, or menu',
          type: 'color'
        },
        {
          name: '--element-base-1-selected',
          usage: 'Selected on base-1 backgrounds, like table, tree, or menu',
          type: 'color'
        },
        {
          name: '--element-base-2',
          usage: 'Page background with higher contrast pages in dark mode',
          type: 'color'
        },
        {
          name: '--element-base-information',
          usage: 'Informational component background for e.g. badges',
          type: 'gradient'
        },
        {
          name: '--element-base-success',
          usage: 'Success component background for e.g. badges',
          type: 'gradient'
        },
        {
          name: '--element-base-caution',
          usage: 'Caution component background for e.g. badges',
          type: 'gradient'
        },
        {
          name: '--element-base-warning',
          usage: 'Warning component background for e.g. badges',
          type: 'gradient'
        },
        {
          name: '--element-base-danger',
          usage: 'Danger component background for e.g. badges',
          type: 'gradient'
        },
        {
          name: '--element-base-translucent-1',
          usage: 'Translucent background, e.g. backdrop',
          type: 'gradient'
        },
        {
          name: '--element-base-translucent-2',
          usage: 'Slightly translucent background, e.g. toasts',
          type: 'gradient'
        }
      ]
    },
    {
      name: 'Actions',
      description: 'Action colors are used to indicate actions that users can perform.',
      properties: [
        { name: '--element-action-primary', usage: 'Primary interaction', type: 'gradient' },
        {
          name: '--element-action-primary-hover',
          usage: 'Primary action background on hover',
          type: 'gradient'
        },
        { name: '--element-action-primary-text', usage: 'Primary text color', type: 'color' },
        { name: '--element-action-secondary', usage: 'Secondary interaction', type: 'gradient' },
        {
          name: '--element-action-secondary-hover',
          usage: 'Secondary action background on hover',
          type: 'gradient'
        },
        { name: '--element-action-secondary-text', usage: 'Secondary text color', type: 'color' },
        {
          name: '--element-action-secondary-text-hover',
          usage: 'Secondary text color on hover',
          type: 'color'
        },
        {
          name: '--element-action-secondary-border',
          usage: 'Secondary border color',
          type: 'color'
        },
        {
          name: '--element-action-secondary-border-hover',
          usage: 'Secondary border color on hover',
          type: 'color'
        },
        { name: '--element-action-warning', usage: 'Warning', type: 'gradient' },
        {
          name: '--element-action-warning-hover',
          usage: 'Warning action background on hover',
          type: 'gradient'
        },
        { name: '--element-action-warning-text', usage: 'Warning text color', type: 'color' },
        { name: '--element-action-danger', usage: 'Danger', type: 'gradient' },
        {
          name: '--element-action-danger-hover',
          usage: 'Danger action background on hover',
          type: 'gradient'
        },
        { name: '--element-action-danger-text', usage: 'Danger text color', type: 'color' },
        {
          name: '--element-action-disabled-opacity',
          usage: 'Disabled action opacity',
          type: 'number'
        }
      ]
    },
    {
      name: 'Text',
      description: 'Similarly, categories for typography colors are also defined in this system.',
      properties: [
        { name: '--element-text-primary', usage: 'Primary', type: 'color' },
        { name: '--element-text-secondary', usage: 'Secondary', type: 'color' },
        { name: '--element-text-disabled', usage: 'Disabled', type: 'color' },
        { name: '--element-text-inverse', usage: 'Inverse', type: 'color' },
        { name: '--element-text-active', usage: 'Active', type: 'color' },
        { name: '--element-text-information', usage: 'Informational', type: 'color' },
        { name: '--element-text-success', usage: 'Success', type: 'color' },
        { name: '--element-text-caution', usage: 'Caution', type: 'color' },
        { name: '--element-text-warning', usage: 'Warning', type: 'color' },
        { name: '--element-text-danger', usage: 'Danger', type: 'color' }
      ]
    },
    {
      name: 'Status',
      description:
        'Status colors are used to describe and/or report on the status of different things.',
      properties: [
        { name: '--element-status-information', usage: 'Informational', type: 'color' },
        {
          name: '--element-status-information-contrast',
          usage: 'Informational contrast',
          type: 'color'
        },
        { name: '--element-status-success', usage: 'Success', type: 'color' },
        { name: '--element-status-success-contrast', usage: 'Success contrast', type: 'color' },
        { name: '--element-status-caution', usage: 'Caution', type: 'color' },
        { name: '--element-status-caution-contrast', usage: 'Caution contrast', type: 'color' },
        { name: '--element-status-warning', usage: 'Warning', type: 'color' },
        { name: '--element-status-warning-contrast', usage: 'Warning contrast', type: 'color' },
        { name: '--element-status-danger', usage: 'Danger', type: 'color' },
        { name: '--element-status-danger-contrast', usage: 'Danger contrast', type: 'color' }
      ]
    },
    {
      name: 'Form feedback icons',
      description: 'Icons that are used to indicate a form item status',
      properties: [{ name: '--element-invalid-feedback-icon', usage: 'Danger', type: 'text' }]
    }
  ]
};
