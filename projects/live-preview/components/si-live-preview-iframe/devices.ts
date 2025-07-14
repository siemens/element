/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface Device {
  id: string;
  mode: string;
  name: string;
  height: string;
  width: string;
  notch?: boolean;
  safeAreaPortrait?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  safeAreaLandscape?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export const availableDevices: Device[] = [
  {
    id: 'iphone-12-pro',
    mode: 'ios',
    name: 'iPhone 12 / 12 Pro',
    height: '844',
    width: '390',
    notch: true,
    safeAreaPortrait: { top: 44, bottom: 34, left: 0, right: 0 },
    safeAreaLandscape: { top: 0, bottom: 21, left: 44, right: 44 }
  },
  {
    id: 'iphone-11-pro',
    mode: 'ios',
    name: 'iPhone 11 Pro',
    height: '812',
    width: '375',
    notch: true,
    safeAreaPortrait: { top: 44, bottom: 34, left: 0, right: 0 },
    safeAreaLandscape: { top: 0, bottom: 21, left: 44, right: 44 }
  },
  {
    id: 'iphone-11',
    mode: 'ios',
    name: 'iPhone 11',
    height: '896',
    width: '414',
    notch: true,
    safeAreaPortrait: { top: 44, bottom: 34, left: 0, right: 0 },
    safeAreaLandscape: { top: 0, bottom: 21, left: 44, right: 44 }
  },
  {
    id: 'iphone-x',
    mode: 'ios',
    name: 'iPhone X / XS',
    height: '812',
    width: '375',
    notch: true,
    safeAreaPortrait: { top: 44, bottom: 34, left: 0, right: 0 },
    safeAreaLandscape: { top: 0, bottom: 21, left: 44, right: 44 }
  },
  {
    id: 'iphone-8',
    mode: 'ios',
    name: 'iPhone 8',
    height: '667',
    width: '375',
    safeAreaPortrait: { top: 20, bottom: 0, left: 0, right: 0 },
    safeAreaLandscape: { top: 0, bottom: 0, left: 0, right: 0 }
  },
  {
    id: 'samsung-gal-s20',
    mode: 'md',
    name: 'Samsung Galaxy S20',
    height: '800',
    width: '360',
    safeAreaPortrait: { top: 20, bottom: 10, left: 0, right: 0 },
    safeAreaLandscape: { top: 20, bottom: 10, left: 0, right: 0 }
  },
  {
    id: 'samsung-gal-s10',
    mode: 'md',
    name: 'Samsung Galaxy S10',
    height: '760',
    width: '360',
    safeAreaPortrait: { top: 20, bottom: 10, left: 0, right: 0 },
    safeAreaLandscape: { top: 20, bottom: 10, left: 0, right: 0 }
  },
  {
    id: 'samsung-gal-s9',
    mode: 'md',
    name: 'Samsung Galaxy S9',
    height: '740',
    width: '360',
    safeAreaPortrait: { top: 20, bottom: 10, left: 0, right: 0 },
    safeAreaLandscape: { top: 20, bottom: 10, left: 0, right: 0 }
  },
  {
    id: 'samsung-gal-note10',
    mode: 'md',
    name: 'Samsung Galaxy Note 10',
    height: '869',
    width: '412',
    safeAreaPortrait: { top: 20, bottom: 10, left: 0, right: 0 },
    safeAreaLandscape: { top: 20, bottom: 10, left: 0, right: 0 }
  }
];
