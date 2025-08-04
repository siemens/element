/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef
} from '@angular/core';
import { elementOk, addIcons, SiIconNextComponent } from '@siemens/element-ng/icon';

import { SiSelectOptionComponent } from '../select-option/si-select-option.component';
import { SelectOption } from '../si-select.types';

@Component({
  selector: 'si-select-option-row',
  imports: [SiIconNextComponent, SiSelectOptionComponent],
  templateUrl: './si-select-option-row.component.html',
  styleUrl: './si-select-option-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dropdown-item focus-none pe-4 gap-4',
    '[class.disabled]': '!!this.option().disabled',
    '[attr.aria-selected]': 'selected()',
    '[attr.data-id]': 'this.option().value'
  }
})
export class SiSelectOptionRowComponent {
  readonly option = input.required<SelectOption<unknown>>();
  readonly optionTemplate = input<TemplateRef<unknown>>();
  /** @defaultValue false */
  readonly selected = input(false, { transform: booleanAttribute });
  protected readonly icons = addIcons({ elementOk });
}
