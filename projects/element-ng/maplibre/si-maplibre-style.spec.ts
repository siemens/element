/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { injectSiMapStyle } from './si-maplibre-style';

describe('injectSiMapStyle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    document.documentElement.classList.remove('app--dark');
  });

  it('includes the API key in the style URLs', () => {
    const style = TestBed.runInInjectionContext(() => injectSiMapStyle('my-api-key'));
    const json = JSON.stringify(style());
    expect(json).toContain('my-api-key');
  });

  it('returns different styles for light and dark themes', () => {
    const style = TestBed.runInInjectionContext(() => injectSiMapStyle('test-key'));
    const lightJson = JSON.stringify(style());

    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: true } }));

    const darkJson = JSON.stringify(style());
    expect(darkJson).not.toBe(lightJson);
  });
});
