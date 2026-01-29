/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

// Environment configuration for ESM build (native federation)
// This file is used when running dashboards-demo-esm

export const environment = {
  mfeBaseUrl: 'http://localhost:4203',
  mfeEsmBaseUrl: 'http://localhost:4205',
  webComponentsBaseUrl: 'http://localhost:4202',
  useModuleFederation: false
};
