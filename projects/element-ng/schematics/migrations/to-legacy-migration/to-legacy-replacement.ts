/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { RenameInstruction } from '../../utils/index.js';

export const IDENTIFIER_RENAMING_INSTRUCTIONS: RenameInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/icon)?/,
    symbolRenamings: [['SiIconComponent', 'SiIconLegacyComponent']]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/tabs)?/,
    symbolRenamings: [
      ['SiTabComponent', 'SiTabLegacyComponent'],
      ['SiTabsetComponent', 'SiTabsetLegacyComponent'],
      ['SiTabsModule', 'SiTabsLegacyModule']
    ],
    toModule: '@siemens/element-ng/tabs-legacy'
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/popover)?/,
    symbolRenamings: [
      ['SiPopoverDirective', 'SiPopoverLegacyDirective'],
      ['SiPopoverModule', 'SiPopoverLegacyModule']
    ],
    toModule: '@siemens/element-ng/popover-legacy'
  }
];

export const ELEMENT_RENAMING_INSTRUCTIONS: [string, string][] = [
  ['si-icon', 'si-icon-legacy'],
  ['si-tabset', 'si-tabset-legacy'],
  ['si-tab', 'si-tab-legacy']
];

export const ATTRIBUTE_RENAMING_INSTRUCTIONS: [string, string][] = [
  ['siPopover', 'siPopoverLegacy']
];
