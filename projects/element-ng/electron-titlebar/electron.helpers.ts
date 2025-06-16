/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export const runsInElectron = (): boolean => {
  const windowAny = window as any;
  const processAny = windowAny.process as any;

  // Renderer process
  if (
    typeof windowAny !== 'undefined' &&
    typeof processAny === 'object' &&
    processAny.type === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (
    typeof processAny !== 'undefined' &&
    typeof processAny.versions === 'object' &&
    !!processAny.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.includes('Electron')
  ) {
    return true;
  }
  return false;
};
