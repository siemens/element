/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSelectComplexOptionsDirective } from './options/si-select-complex-options.directive';
import { SiSelectSimpleOptionsDirective } from './options/si-select-simple-options.directive';
import { SiSelectMultiValueDirective } from './selection/si-select-multi-value.directive';
import { SiSelectSingleValueDirective } from './selection/si-select-single-value.directive';
import { SiSelectActionDirective } from './si-select-action.directive';
import { SiSelectActionsDirective } from './si-select-actions.directive';
import { SiSelectGroupTemplateDirective } from './si-select-group-template.directive';
import { SiSelectOptionTemplateDirective } from './si-select-option-template.directive';
import { SiSelectComponent } from './si-select.component';

@NgModule({
  imports: [
    SiSelectActionDirective,
    SiSelectActionsDirective,
    SiSelectComplexOptionsDirective,
    SiSelectComponent,
    SiSelectGroupTemplateDirective,
    SiSelectMultiValueDirective,
    SiSelectOptionTemplateDirective,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective
  ],
  exports: [
    SiSelectActionDirective,
    SiSelectActionsDirective,
    SiSelectComplexOptionsDirective,
    SiSelectComponent,
    SiSelectGroupTemplateDirective,
    SiSelectMultiValueDirective,
    SiSelectOptionTemplateDirective,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective
  ]
})
export class SiSelectModule {}
