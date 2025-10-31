/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { ElementMigrationConfig, elementMigrationRule } from '../../utils/index.js';

export const fromNextMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Running from-next migration rule...');
    return elementMigrationRule(FROM_NEXT_CONFIG, options.path)(tree, context);
  };
};

/**
 * Configuration for migrating from next to current versions
 */
export const FROM_NEXT_CONFIG: ElementMigrationConfig = {
  identifierRenameInstructions: [
    {
      module: /@(siemens|simpl)\/element-ng(\/icon-next)?/,
      symbolRenamings: [['SiIconNextComponent', 'SiIconComponent']]
    },
    {
      module: /@(siemens|simpl)\/element-ng(\/tabs-next)?/,
      symbolRenamings: [
        ['SiTabNextComponent', 'SiTabComponent'],
        ['SiTabsetNextComponent', 'SiTabsetComponent'],
        ['SiTabsNextModule', 'SiTabsModule']
      ],
      toModule: '@siemens/element-ng/tabs'
    },
    {
      module: /@(siemens|simpl)\/element-ng(\/popover-next)?/,
      symbolRenamings: [
        ['SiPopoverNextDirective', 'SiPopoverDirective'],
        ['SiPopoverNextModule', 'SiPopoverModule']
      ],
      toModule: '@siemens/element-ng/popover'
    }
  ],
  elementRenameInstructions: [
    ['si-icon-next', 'si-icon'],
    ['si-tabset-next', 'si-tabset'],
    ['si-tab-next', 'si-tab']
  ],
  attributeRenameInstructions: [['siPopoverNext', 'siPopover']]
};
