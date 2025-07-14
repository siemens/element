/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { TextMeasureService as TestService } from './text-measure.service';

describe('TextMeasureService', () => {
  let service!: TestService;
  let div: HTMLElement | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TestService] });
    service = TestBed.inject(TestService);
  });

  afterEach(() => {
    div?.remove();
    div = undefined;
  });

  /*
   * This measures a text with optional font family and size using the DOM.
   * Hardcoded numbers don't work because different Platforms and browsers have different default
   * fonts and font loading via CSS doesn't work due to Angular's Karma integration not serving
   * the .woff2 files. Working around that is hacky but possible, but leaves the issue of font
   * loading delays. So using the DOM makes the actual font irrelevant.
   */
  const measureWithDOM = (text: string, font?: string, size?: string): number => {
    const measureDiv = document.createElement('div');
    measureDiv.style.display = 'flex';
    measureDiv.style.width = '640px';
    if (font) {
      measureDiv.style.fontFamily = font;
    }
    if (size) {
      measureDiv.style.fontSize = size;
    }
    document.body.appendChild(measureDiv);

    const textDiv = document.createElement('div');
    textDiv.innerText = text;
    measureDiv.appendChild(textDiv);

    const width = Math.ceil(textDiv.getBoundingClientRect().width);
    measureDiv.remove();

    return width;
  };

  it('allows measuring text with standard body font', () => {
    const text = 'This is a test';
    const domWidth = measureWithDOM(text);
    const width = service.measureText(text);
    expect(width).toBe(domWidth);
  });

  it('allows measuring text with specified font', () => {
    const text = 'This is a test';
    const domWidth = measureWithDOM(text, 'sans-serif', '20px');
    const width = service.measureText(text, '20px sans-serif');
    expect(width).toBe(domWidth);
  });

  it('allows measuring text with reference element', () => {
    const text = 'This is a test';

    div = document.createElement('div');
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '20px';
    document.body.appendChild(div);

    const domWidth = measureWithDOM(text, 'sans-serif', '20px');
    const width = service.measureText(text, div);

    expect(width).toBe(domWidth);
  });
});
