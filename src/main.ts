/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, {
  ...APP_CONFIG,
  providers: [provideZoneChangeDetection(), ...APP_CONFIG.providers]
}).catch(err => console.error(err));
