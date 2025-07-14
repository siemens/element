/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SelectOption, SelectOptionLegacy } from '@siemens/element-ng/select';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-readonly-threshold-option',
  imports: [NgClass, SiTranslatePipe, SiIconNextComponent],
  template: `@let opt = option();
    @if (opt && opt.icon) {
      <i class="icon-stack">
        <si-icon-next
          class="icon me-2"
          [icon]="opt.icon"
          [ngClass]="[(!opt.disabled && color()) || '']"
        />
        @if (opt.type === 'option' && opt.stackedIcon) {
          <si-icon-next
            class="icon me-2"
            [icon]="opt.stackedIcon"
            [ngClass]="opt.stackedIconColor"
          />
        }
      </i>
    }
    <span class="text-truncate">{{ label() | translate }}</span>`,
  styleUrl: './si-readonly-threshold-option.component.scss',
  host: { class: 'd-flex align-items-center py-2 my-4 px-4 si-title-2' }
})
export class SiReadonlyThresholdOptionComponent {
  readonly value = input.required<string>();
  readonly options = input.required<SelectOptionLegacy[] | SelectOption<unknown>[]>();

  protected readonly option = computed(() => {
    const options = this.options();
    const value = this.value();
    if (value && options) {
      return options.find(opt => (opt.type === 'option' ? opt.value === value : opt.id === value));
    }
    return undefined;
  });

  protected readonly color = computed(() => {
    const option = this.option();
    return !option || option.disabled
      ? undefined
      : option.type === 'option'
        ? option.iconColor
        : option.color;
  });

  protected readonly label = computed(() => {
    const option = this.option();
    return option?.type === 'option' ? option.label : option?.title;
  });
}
