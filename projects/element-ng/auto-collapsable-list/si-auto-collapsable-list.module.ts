/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiAutoCollapsableListAdditionalContentDirective } from './si-auto-collapsable-list-additional-content.directive';
import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListOverflowItemDirective } from './si-auto-collapsable-list-overflow-item.directive';
import { SiAutoCollapsableListDirective } from './si-auto-collapsable-list.directive';

@NgModule({
  imports: [
    SiAutoCollapsableListAdditionalContentDirective,
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective
  ],
  exports: [
    SiAutoCollapsableListAdditionalContentDirective,
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective
  ]
})
export class SiAutoCollapsableListModule {}
