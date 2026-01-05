/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { vi } from 'vitest';

// Mock window.alert for maps tests
if (typeof window !== 'undefined') {
  window.alert = vi.fn();
}

// Mock scrollIntoView for jsdom
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn() as any;
}

// Import test styles
import '../element-theme/src/theme.scss';
import './test-styles.scss';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
