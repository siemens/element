/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SelectOption } from '@siemens/element-ng/select';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-readonly-threshold-option',
  imports: [SiTranslatePipe, SiIconComponent],
  template: `@let opt = option();
    @if (opt && opt.icon) {
      <i class="icon-stack">
        <si-icon class="icon me-2" [class]="color()" [icon]="opt.icon" />
        @if (opt.stackedIcon) {
          <si-icon class="icon me-2" [class]="opt.stackedIconColor" [icon]="opt.stackedIcon" />
        }
      </i>
    }
    <span class="text-truncate">{{ label() | translate }}</span>`,
  styleUrl: './si-readonly-threshold-option.component.scss',
  host: { class: 'd-flex align-items-center py-2 my-4 px-4 si-h5' }
})
export class SiReadonlyThresholdOptionComponent {
  readonly value = input.required<string>();
  readonly options = input.required<SelectOption<unknown>[]>();

  protected readonly option = computed(() => {
    const options = this.options();
    const value = this.value();
    if (value && options) {
      return options.find(opt => opt.value === value);
    }
    return undefined;
  });

  protected readonly color = computed(() => {
    const option = this.option();
    return !option || option.disabled ? undefined : option.iconColor;
  });

  protected readonly label = computed(() => this.option()?.label);
}
