/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { themeElement } from '../shared/themes/element';
import { ColorPalette } from './color-palette.type';

/**
 * Class for grouping functionality
 */
export class Grouping {
  private readonly _colors: string[];
  private readonly _palette?: ColorPalette;

  constructor(groupColors: Record<number, string> | ColorPalette = 'status') {
    this._colors = [];

    if (typeof groupColors === 'string') {
      const colorPalette = groupColors;
      this._colors = [colorPalette];

      if (colorPalette === 'element') {
        this._palette = colorPalette as ColorPalette;
        this._colors = themeElement.style().colorPalette.element;
      } else {
        this._palette = 'status';
        this._colors = themeElement.style().colorPalette.status;
      }
    } else {
      Object.keys(groupColors).forEach((key: string) => {
        const numKey = Number(key);
        if (numKey <= 0) {
          throw new Error('Key is out of range: keys should start from 1 and do not repeat');
        }
        this._colors[Number(key) - 1] = groupColors[numKey];
      });
    }
  }

  get colors(): string[] {
    return Object.values(this._colors);
  }

  get palette(): string | undefined {
    return this._palette;
  }

  get length(): number {
    return this._colors.length;
  }

  getColor(groupId: number): string {
    // Group has higher index than available colors,
    // cycle trough them.
    if (groupId > this._colors.length) {
      const index = groupId % this._colors.length;
      return this._colors[index];
    } else {
      return this._colors[groupId - 1];
    }
  }
}
