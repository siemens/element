/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import {
  AttributeSelectorInstruction,
  SymbolRenamingInstruction,
  ComponentPropertyNamesInstruction,
  ElementMigrationData,
  ElementSelectorInstruction,
  SymbolRemovalInstruction,
  ClassMemberReplacementInstruction
} from './index.js';

const SYMBOL_RENAMING_MIGRATION: SymbolRenamingInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/icon)?/,
    symbolRenamings: [
      {
        replace: 'SiIconComponent',
        replaceWith: 'SiIconLegacyComponent'
      }
    ]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/icon-next)?/,
    symbolRenamings: [
      {
        replace: 'SiIconNextComponent',
        replaceWith: 'SiIconComponent'
      }
    ]
  },
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
  {
    module: /@(siemens|simpl)\/element-ng(\/popover)?/,
    symbolRenamings: [
      { replace: 'SiPopoverDirective', replaceWith: 'SiPopoverLegacyDirective' },
      { replace: 'SiPopoverModule', replaceWith: 'SiPopoverLegacyModule' }
    ],
    toModule: '@siemens/element-ng/popover-legacy'
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/popover-next)?/,
    symbolRenamings: [
      { replace: 'SiPopoverNextDirective', replaceWith: 'SiPopoverDirective' },
      { replace: 'SiPopoverNextModule', replaceWith: 'SiPopoverModule' }
    ],
    toModule: '@siemens/element-ng/popover'
  },
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
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    symbolRenamings: [
      { replace: 'SiUnauthorizedPageComponent', replaceWith: 'SiInfoPageComponent' }
    ],
    toModule: '@siemens/element-ng/info-page'
  }
];

const ATTRIBUTE_SELECTORS_MIGRATION: AttributeSelectorInstruction[] = [
  { replace: 'siPopover', replaceWith: 'siPopoverLegacy' },
  { replace: 'siPopoverNext', replaceWith: 'siPopover' }
];

const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [
  // current to legacy
  { replace: 'si-icon', replaceWith: 'si-icon-legacy' },
  { replace: 'si-tabset', replaceWith: 'si-tabset-legacy' },
  { replace: 'si-tab', replaceWith: 'si-tab-legacy' },

  // next to current
  { replace: 'si-icon-next', replaceWith: 'si-icon' },
  { replace: 'si-tabset-next', replaceWith: 'si-tabset' },
  { replace: 'si-tab-next', replaceWith: 'si-tab' },
  // v48 to v49
  {
    replace: 'si-unauthorized-page',
    replaceWith: 'si-info-page',
    defaultAttributes: [
      { name: 'icon', value: 'element-warning-filled' },
      { name: 'iconColor', value: 'status-warning' }
    ]
  }
];

const SYMBOL_REMOVALS_MIGRATION: SymbolRemovalInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-accordion',
    names: ['colorVariant']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDateInput',
    names: ['dateInputDebounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'input',
    attributeSelector: 'siDatepicker',
    names: ['triggeringInput']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/datepicker)?/,
    elementSelector: 'si-date-range',
    names: ['debounceTime']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/filtered-search)?/,
    elementSelector: 'si-filtered-search',
    names: ['showIcon', 'noMatchingCriteriaText']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/form)?/,
    elementSelector: 'si-form-item',
    names: ['inputId', 'readonly']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-navbar-vertical',
    names: ['autoCollapseDelay']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/split)?/,
    elementSelector: 'si-split-part',
    names: ['headerStatusColor', 'headerStatusIconClass']
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/navbar-vertical)?/,
    elementSelector: 'si-tree-view',
    names: ['disableFilledIcons', 'trackByFunction']
  },
  {
    module: /@(siemens|simpl)\/charts-ng/,
    elementSelector: 'si-chart-gauge',
    names: ['numberOfDecimals']
  }
];

const COMPONENT_PROPERTY_NAMES_MIGRATION: ComponentPropertyNamesInstruction[] = [
  // Output name changes
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-collapsible-panel',
    propertyMappings: [{ replace: '(toggle)', replaceWith: '(panelToggle)' }]
  },
  // Input name changes
  // v48 to v49
  {
    module: /@(siemens|simpl)\/element-ng/,
    elementSelector: 'si-filtered-search',
    propertyMappings: [{ replace: 'readonly', replaceWith: 'disabled' }]
  },
  {
    module: /@(siemens|simpl)\/charts-ng/,
    elementSelector: 'si-chart-gauge',
    propertyMappings: [
      { replace: 'numberOfDecimals', replaceWith: ['minNumberOfDecimals', 'maxNumberOfDecimals'] }
    ]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    elementSelector: 'si-unauthorized-page',
    propertyMappings: [
      { replace: 'heading', replaceWith: 'titleText' },
      { replace: 'subHeading', replaceWith: 'copyText' },
      { replace: 'description', replaceWith: 'instructions' }
    ]
  }
];

const CLASS_MEMBER_REPLACEMENTS_MIGRATION: ClassMemberReplacementInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/resize-observer)?/,
    typeNames: ['SiResponsiveContainerDirective'],
    propertyReplacements: [
      { property: 'isXs', replacement: '${expression}.xs()' },
      { property: 'isSm', replacement: '${expression}.sm()' },
      { property: 'isMd', replacement: '${expression}.md()' },
      { property: 'isLg', replacement: '${expression}.lg()' },
      { property: 'isXl', replacement: '${expression}.xl()' },
      { property: 'isXxl', replacement: '${expression}.xxl()' }
    ]
  }
];

/**
 * Stable migration data for testing.
 * This data is frozen and used for testing to ensure test stability.
 * Do not modify this data unless you intend to update the test expectations.
 */
export const getElementMigrationTestData = (): ElementMigrationData => ({
  attributeSelectorChanges: ATTRIBUTE_SELECTORS_MIGRATION,
  symbolRenamingChanges: SYMBOL_RENAMING_MIGRATION,
  componentPropertyNameChanges: COMPONENT_PROPERTY_NAMES_MIGRATION,
  elementSelectorChanges: ELEMENT_SELECTORS_MIGRATION,
  symbolRemovalChanges: SYMBOL_REMOVALS_MIGRATION,
  classMemberReplacementChanges: CLASS_MEMBER_REPLACEMENTS_MIGRATION
});
