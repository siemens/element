/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { themeElement, themeSupport } from '@spike-rabbit/charts-ng';
// FIXME: Check and update to native federation
import { registerModuleFederatedWidgetLoader } from '@spike-rabbit/dashboards-ng/module-federation';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

themeSupport.setDefault(themeElement);
// FIXME: Check and update to native federation
registerModuleFederatedWidgetLoader();

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
