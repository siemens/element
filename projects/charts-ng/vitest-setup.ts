/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { vi } from 'vitest';

// Manual canvas mock for happy-dom compatibility
// Create a mock context object that can be assigned to
const createMockContext = (): any => {
  const ctx: any = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
    putImageData: vi.fn(),
    canvas: { width: 300, height: 300 }
  };

  // Make font property writable
  Object.defineProperty(ctx, 'font', {
    value: '12px "SiemensSans Pro"',
    writable: true,
    configurable: true
  });

  return ctx;
};

// Function to setup canvas mock
const setupCanvasMock = () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const originalCreateElement = globalThis.document.createElement.bind(globalThis.document);
  (globalThis.document as any).createElement = function (tagName: string, options?: any) {
    if (tagName.toLowerCase() === 'canvas') {
      const canvas = originalCreateElement.call(this, tagName, options) as HTMLCanvasElement;
      // Override getContext to return our mock
      const mockGetContext = (contextType: string, ...args: any[]): any => {
        if (contextType === '2d') {
          return createMockContext();
        }
        return null;
      };

      // Replace getContext method
      canvas.getContext = mockGetContext as any;

      // Set width and height properties
      canvas.width = 300;
      canvas.height = 300;

      return canvas;
    }
    return originalCreateElement.call(this, tagName, options);
  };
};

// Apply mock initially
setupCanvasMock();

// Re-apply mock before each test (happy-dom may reset document)
beforeEach(() => {
  setupCanvasMock();
});

// Now import Angular
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Import test styles
import '../element-theme/src/theme.scss';
import './test-styles.scss';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
