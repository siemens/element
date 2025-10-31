/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { ElementMigrationConfig, elementMigrationRule } from '../../utils/index.js';

export const toLegacyMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Running to-legacy migration rule...');
    return elementMigrationRule(TO_LEGACY_CONFIG, options.path)(tree, context);
  };
};

/**
 * Configuration for migrating from current to legacy versions
 */
const TO_LEGACY_CONFIG: ElementMigrationConfig = {
  identifierRenameInstructions: [
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
  ],
  elementRenameInstructions: [
    ['si-icon', 'si-icon-legacy'],
    ['si-tabset', 'si-tabset-legacy'],
    ['si-tab', 'si-tab-legacy']
  ],
  attributeRenameInstructions: [['siPopover', 'siPopoverLegacy']]
};
