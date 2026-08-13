/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { injectIsDarkTheme } from './si-theme-signals';

describe('injectIsDarkTheme', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    document.documentElement.classList.remove('app--dark');
  });

  it('returns false when the page has no dark class', () => {
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(false);
  });

  it('returns true when the page has the dark class', () => {
    document.documentElement.classList.add('app--dark');
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(true);
  });

  it('updates to true when a dark theme-switch event fires', () => {
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: true } }));
    expect(isDark()).toBe(true);
  });

  it('updates to false when a light theme-switch event fires', () => {
    document.documentElement.classList.add('app--dark');
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(true);
    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: false } }));
    expect(isDark()).toBe(false);
  });

  it('throws when called outside an injection context', () => {
    expect(() => injectIsDarkTheme()).toThrow();
  });
});
