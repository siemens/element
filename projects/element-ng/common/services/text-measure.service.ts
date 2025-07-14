/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export interface FontStyleOverride {
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  fontSize?: string;
  fontFamily?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextMeasureService {
  private measureCanvas?: CanvasRenderingContext2D;
  private defaultFont?: string;
  private document = inject(DOCUMENT);
  /** Measure text width in pixel. */
  measureText(text: string, fontRef?: HTMLElement | string, overrides?: FontStyleOverride): number {
    this.ensureCanvas();
    this.setFontStyle(fontRef, overrides);
    return Math.ceil(this.measureCanvas!.measureText(text).width);
  }
  /** Get font styles for `font` CSS short-hand property. */
  getFontStyle(element: HTMLElement, overrides?: FontStyleOverride): string {
    const style = getComputedStyle(element);
    // note: can't use destructuring on `style` as it doesn't work on Firefox
    const fontStyle = overrides?.fontStyle ?? style.fontStyle;
    const fontVariant = overrides?.fontVariant ?? style.fontVariant;
    const fontWeight = overrides?.fontWeight ?? style.fontWeight;
    const fontSize = overrides?.fontSize ?? style.fontSize;
    const fontFamily = overrides?.fontFamily ?? style.fontFamily;
    return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`
      .replace(/ +/g, ' ')
      .trim();
  }

  private ensureCanvas(): void {
    if (this.measureCanvas) {
      return;
    }
    const canvas = this.document.createElement('canvas') as HTMLCanvasElement;
    this.measureCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  private setFontStyle(fontRef?: HTMLElement | string, overrides?: FontStyleOverride): void {
    if (typeof fontRef === 'string') {
      this.measureCanvas!.font = fontRef;
      return;
    }
    if (fontRef || overrides) {
      this.measureCanvas!.font = this.getFontStyle(fontRef ?? this.document.body, overrides);
      return;
    }
    this.defaultFont ??= this.getFontStyle(this.document.body);
    this.measureCanvas!.font = this.defaultFont;
  }
}
