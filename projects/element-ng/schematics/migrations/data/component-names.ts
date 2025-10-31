/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ComponentNamesInstruction {
  module: RegExp;
  toModule?: string;
  symbolRenamings: { replace: string; replaceWith: string }[];
}

export const COMPONENT_NAMES_MIGRATION: ComponentNamesInstruction[] = [
  // Icon current to legacy
  {
    module: /@(siemens|simpl)\/element-ng(\/icon)?/,
    symbolRenamings: [
      {
        replace: 'SiIconComponent',
        replaceWith: 'SiIconLegacyComponent'
      }
    ]
  },
  // Icon next to current
  {
    module: /@(siemens|simpl)\/element-ng(\/icon-next)?/,
    symbolRenamings: [
      {
        replace: 'SiIconNextComponent',
        replaceWith: 'SiIconComponent'
      }
    ]
  },
  // Tabs current to legacy
  {
    module: /@(siemens|simpl)\/element-ng(\/tabs)?/,
    symbolRenamings: [
      {
        replace: 'SiTabComponent',
        replaceWith: 'SiTabLegacyComponent'
      },
      {
        replace: 'SiTabsetComponent',
        replaceWith: 'SiTabsetLegacyComponent'
      },
      {
        replace: 'SiTabsModule',
        replaceWith: 'SiTabsLegacyModule'
      }
    ],
    toModule: '@siemens/element-ng/tabs-legacy'
  },
  // Tabs next to current
  {
    module: /@(siemens|simpl)\/element-ng(\/tabs-next)?/,
    symbolRenamings: [
      {
        replace: 'SiTabNextComponent',
        replaceWith: 'SiTabComponent'
      },
      {
        replace: 'SiTabsetNextComponent',
        replaceWith: 'SiTabsetComponent'
      },
      {
        replace: 'SiTabsNextModule',
        replaceWith: 'SiTabsModule'
      }
    ],
    toModule: '@siemens/element-ng/tabs'
  },
  // Popover current to legacy
  {
    module: /@(siemens|simpl)\/element-ng(\/popover)?/,
    symbolRenamings: [
      { replace: 'SiPopoverDirective', replaceWith: 'SiPopoverLegacyDirective' },
      { replace: 'SiPopoverModule', replaceWith: 'SiPopoverLegacyModule' }
    ],
    toModule: '@siemens/element-ng/popover-legacy'
  },

  // Popover next to current
  {
    module: /@(siemens|simpl)\/element-ng(\/popover-next)?/,
    symbolRenamings: [
      { replace: 'SiPopoverNextDirective', replaceWith: 'SiPopoverDirective' },
      { replace: 'SiPopoverNextModule', replaceWith: 'SiPopoverModule' }
    ],
    toModule: '@siemens/element-ng/popover'
  }
];
