/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { ExtendedStatusType } from '@siemens/element-ng/common';
import { SiIconComponent, STATUS_ICON_CONFIG } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-status-bar-item',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-status-bar-item.component.html',
  styleUrl: './si-status-bar-item.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    '[class.clickable]': 'clickable()'
  }
})
export class SiStatusBarItemComponent implements OnChanges {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  /**
   * Status that determines the displayed icon and color.
   */
  readonly status = input<ExtendedStatusType>();
  /**
   * Value displayed by the status bar item.
   */
  readonly value = input.required<TranslatableString | number>();
  /**
   * Heading displayed for the status bar item.
   */
  readonly heading = input.required<TranslatableString>();
  /**
   * Custom background color for the item.
   */
  readonly color = input<string>();
  /**
   * Whether the item blinks to highlight its status.
   *
   * @defaultValue false
   */
  readonly blink = input(false, { transform: booleanAttribute });
  /**
   * Whether only the value is displayed.
   *
   * @defaultValue false
   */
  readonly valueOnly = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });
  /**
   * Whether the item has an interactive appearance.
   *
   * @defaultValue false
   */
  readonly clickable = input(false, { transform: booleanAttribute });

  /**
   * Emits when the value changes between an empty and non-empty state.
   */
  readonly significanceChange = output<void>();

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

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.value) {
      if (
        (changes.value.previousValue && !changes.value.currentValue) ||
        (!changes.value.previousValue && changes.value.currentValue)
      ) {
        this.significanceChange.emit();
      }
    }
  }

  private calculateContrastFix(): boolean {
    // see https://www.w3.org/TR/AERT/#color-contrast
    const rgb = getComputedStyle(this.bg().nativeElement)
      .backgroundColor?.match(/\d+/g)
      ?.map(v => +v);
    return !!rgb && Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000) <= 128;
  }
}
