/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
// Import angular compiler to enable JIT compilation in the live preview even in AOT mode.
import '@angular/compiler';
import { bootstrapApplication, createApplication } from '@angular/platform-browser';
import { defineLivePreviewElements } from '@siemens/live-preview/elements';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

ModuleRegistry.registerModules([AllCommunityModule]);

// The same build can run standalone or register the documentation web components.
const application = document.querySelector('app-root')
  ? bootstrapApplication(AppComponent, APP_CONFIG)
  : createApplication(APP_CONFIG);

application.then(app => defineLivePreviewElements(app.injector)).catch(err => console.error(err));
