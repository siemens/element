/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

// This entry point is for webpack-based Module Federation builds.
// For Native Federation (ESM) builds, use main.esm.ts instead.
import('./bootstrap').catch(err => console.error(err));
