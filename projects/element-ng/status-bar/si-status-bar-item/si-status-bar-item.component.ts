/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild
} from '@angular/core';
import { ExtendedStatusType } from '@siemens/element-ng/common';
import { SiIconNextComponent, STATUS_ICON_CONFIG } from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-status-bar-item',
  imports: [NgClass, SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-status-bar-item.component.html',
  styleUrl: './si-status-bar-item.component.scss',
  host: {
    '[class.clickable]': 'clickable()'
  }
})
export class SiStatusBarItemComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  readonly status = input<ExtendedStatusType>();
  readonly value = input.required<string | number>();
  readonly heading = input.required<string>();
  readonly color = input<string>();
  /** @defaultValue false */
  readonly blink = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly valueOnly = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly clickable = input(false, { transform: booleanAttribute });

  private readonly bg = viewChild.required<ElementRef>('bg');

  protected readonly contrastFix = computed(() => {
    return !!this.color() && this.blink() && this.calculateContrastFix();
  });
  protected readonly statusIcon = computed(() => {
    const status = this.status();
    return status ? this.statusIcons[status] : undefined;
  });
  protected readonly background = computed(() =>
    this.blink() && this.status() !== 'success' ? (this.statusIcon()?.background ?? '') : ''
  );

  private calculateContrastFix(): boolean {
    // see https://www.w3.org/TR/AERT/#color-contrast
    const rgb = getComputedStyle(this.bg().nativeElement)
      .backgroundColor?.match(/\d+/g)
      ?.map(v => +v);
    return !!rgb && Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000) <= 128;
  }
}
