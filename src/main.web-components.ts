/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createApplication } from '@angular/platform-browser';
import { defineLivePreviewElements } from '@siemens/live-preview/elements';

import { WEB_COMPONENTS_CONFIG } from './app/web-components.config';

createApplication(WEB_COMPONENTS_CONFIG)
  .then(app => defineLivePreviewElements(app.injector))
  .catch(err => console.error(err));
