/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { injectIsDarkTheme } from './si-theme-signals';

describe('injectIsDarkTheme', () => {
  let testDocument: Document;
  let rootClassName: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    testDocument = TestBed.inject(DOCUMENT);
    rootClassName = testDocument.documentElement.className;
    testDocument.documentElement.classList.remove('app--dark');
  });

  afterEach(() => (testDocument.documentElement.className = rootClassName));

  it('returns false when the page has no dark class', () => {
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(false);
  });

  it('returns true when the page has the dark class', () => {
    testDocument.documentElement.classList.add('app--dark');
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(true);
  });

  it('updates to true when a dark theme-switch event fires', () => {
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: true } }));
    expect(isDark()).toBe(true);
  });

  it('updates to false when a light theme-switch event fires', () => {
    testDocument.documentElement.classList.add('app--dark');
    const isDark = TestBed.runInInjectionContext(() => injectIsDarkTheme());
    expect(isDark()).toBe(true);
    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: false } }));
    expect(isDark()).toBe(false);
  });

  it('throws when called outside an injection context', () => {
    expect(() => injectIsDarkTheme()).toThrow();
  });
});
