/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
// global Object in a NodeJS context, which we have when building types for web-components or building with angular SSR
declare const global: any;

/**
 * This var provides access to the global scope object based on the current runtime.
 * On Browser its is the window, on Node.js it is global.
 *
 * Whenever possible, inject(DOCUMENT) is preferred over this approach.
 */
let globalScope: any;

// we are either running Browser or on NodeJS
if (typeof window !== 'undefined') {
  globalScope = window;
} else if (typeof global !== 'undefined') {
  globalScope = global;
}

export { globalScope };
