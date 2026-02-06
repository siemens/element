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
