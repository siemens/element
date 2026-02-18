/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { environment } from './environments/environment';

(async () => {
  /**
   * Micro Frontend Widget Loading Strategy
   *
   * This application supports two federation approaches for loading remote widgets:
   *
   * 1. Webpack Module Federation (simpler setup)
   *    - Register the widget loader via `registerModuleFederatedWidgetLoader()`
   *
   * 2. Native Federation (recommended for Angular)
   *    - Requires explicit initialization of Native Federation
   *    - Optionally supports Webpack Module Federation remotes via `@module-federation/runtime`
   */
  if (environment.useModuleFederation) {
    import('@siemens/dashboards-ng/module-federation').then(m => {
      m.registerModuleFederatedWidgetLoader();

      import('./bootstrap');
    });
  } else {
    /**
     * Native Federation Setup with optional Webpack Module Federation support for remotes
     *
     * Steps:
     * 1. Initialize Native Federation via `initFederation()`
     * 2. Extract shared dependencies for Module Federation compatibility
     * 3. Create a Module Federation runtime instance for Webpack-based remotes
     * 4. Register both widget loaders to support mixed federation environments
     */
    const { getShared, initFederation } = await import('@angular-architects/native-federation');

    const { createInstance } = await import('@module-federation/runtime');

    // Step 1: Initialize Native Federation
    await initFederation();

    // Step 2: Get shared dependencies for Module Federation interoperability
    const shared = getShared();

    // Step 3: Initialize Module Federation runtime for Webpack-based remotes
    // Note: Consider loading this config dynamically via fetch API for flexibility
    // Resolve relative mfeBaseUrl against the document's baseURI to get an absolute URL
    // This ensures the remote entry URL works correctly when deployed in subdirectories (e.g., S3 bucket paths)
    const mfeEntryUrl = new URL(`${environment.mfeBaseUrl}/remoteEntry.js`, document.baseURI).href;
    const mfInstance = createInstance({
      name: 'shell',
      remotes: [
        {
          name: 'mfe',
          entry: mfeEntryUrl,
          type: 'esm'
        }
      ],
      shared
    });

    // Initialize shared dependency resolution
    mfInstance.initializeSharing();

    // Step 4: Register widget loaders for both federation types
    Promise.all([
      import('@siemens/dashboards-ng/native-federation'),
      import('@siemens/dashboards-ng/native-federation/mf-bridge')
    ]).then(([nativeFederation, mfBridge]) => {
      nativeFederation.registerNativeFederatedWidgetLoader();
      mfBridge.registerModuleFederatedWidgetLoader(mfInstance);

      import('./bootstrap');
    });
  }
})();
