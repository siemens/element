/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, APP_CONFIG).catch(err => console.error(err));
