/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiSelectOptionTemplateDirective } from '../si-select-option-template.directive';
import { SelectOption } from '../si-select.types';

@Component({
  selector: 'si-select-option',
  templateUrl: './si-select-option.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    NgTemplateOutlet,
    SiIconNextComponent,
    SiTranslateModule,
    SiSelectOptionTemplateDirective
  ],
  host: {
    class: 'd-flex align-items-center overflow-hidden'
  }
})
export class SiSelectOptionComponent {
  readonly option = input.required<SelectOption<unknown>>();
  readonly optionTemplate = input<TemplateRef<unknown>>();
}
