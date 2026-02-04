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
  // v47 to v48
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
  },
  // v48 to v49
  {
    module: /@(siemens|simpl)\/dashboards-ng/,
    symbolRenamings: [{ replace: 'CONFIG_TOKEN', replaceWith: 'SI_DASHBOARD_CONFIGURATION' }]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/toast-notification)?/,
    symbolRenamings: [{ replace: 'ToastStateName', replaceWith: 'StatusType' }],
    toModule: '@siemens/element-ng/common'
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/filtered-search)?/,
    symbolRenamings: [{ replace: 'Criterion', replaceWith: 'CriterionValue' }]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    symbolRenamings: [
      { replace: 'SiUnauthorizedPageComponent', replaceWith: 'SiInfoPageComponent' }
    ],
    toModule: '@siemens/element-ng/info-page'
  }
];
