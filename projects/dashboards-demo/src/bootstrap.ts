/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
// FIXME: Check and update to native federation
import { registerModuleFederatedWidgetLoader } from '@siemens/dashboards-ng/module-federation';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// FIXME: Check and update to native federation
registerModuleFederatedWidgetLoader();

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
