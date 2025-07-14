/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  input,
  numberAttribute,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';

const DATA_COLORS_MAX = 17;
const DATA_COLOR_NEUTRAL = 17;
const ASCII_CODE_INDEX_A = 64;

/**
 * The directive provide a CSS variable --background with a color based on the initials or alt text.
 */
@Directive({
  selector: '[siAvatarBackgroundColor]',
  host: {
    '[style.--background]': 'backgroundStyle()'
  }
})
export class SiAvatarBackgroundColorDirective implements OnChanges {
  /**
   * The desired color index from $element-data-* color tokens. This can be set to any kind of
   * positive integer that is then mapped to a color index.
   * A better way to set a pseudo-random color is to set {@link autoColor} to `true`.
   *
   * @defaultValue undefined
   */
  readonly color = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  /**
   * Automatically calculates the background color.
   * If set, {@link color} will be ignored.
   *
   * @defaultValue false
   */
  readonly autoColor = input(false, { transform: booleanAttribute });

  protected readonly backgroundStyle = signal<string | undefined>('var(--element-data-17)');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.color) {
      this.setColor(this.color());
    }
  }

  /**
   * Update background color variable based on the initials or placeholder text.
   */
  public calculateColorFromInitials(displayInitials?: string): void {
    if (!this.autoColor() || !displayInitials) {
      return;
    }

    let color = 0;
    for (let i = 0; i < displayInitials.length; i++) {
      color *= 17; // this prevents 'JD' to have the same color as 'DJ'
      color += displayInitials.charCodeAt(i) - ASCII_CODE_INDEX_A;
    }
    this.setColor(color);
  }

  private setColor(color?: number): void {
    if (this.color() === 0) {
      this.backgroundStyle.set(undefined);
    } else {
      const actualColor = color ?? DATA_COLOR_NEUTRAL;
      const colorIndex = ((actualColor - 1) % DATA_COLORS_MAX) + 1;
      this.backgroundStyle.set(`var(--element-data-${colorIndex})`);
    }
  }
}
