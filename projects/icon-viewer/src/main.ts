/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import { AppRootComponent } from './app/app.component';

(async () => {
  const app = await createApplication();
  const siIconViewer = createCustomElement(AppRootComponent, { injector: app.injector });
  customElements.define('si-icon-viewer', siIconViewer);
})();
