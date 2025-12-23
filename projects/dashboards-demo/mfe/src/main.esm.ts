/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .then(() => {
    import('./bootstrap').catch(err => console.error(err));
  })
  .catch(err => console.error(err));
