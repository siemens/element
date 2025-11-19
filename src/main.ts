/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
import {
  InfiniteRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  RowDragModule,
  TextFilterModule,
  ClientSideRowModelModule,
  ValidationModule,
  RowSelectionModule,
  TooltipModule
} from 'ag-grid-community';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

ModuleRegistry.registerModules([
  RowDragModule,
  InfiniteRowModelModule,
  NumberFilterModule,
  TextFilterModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  TooltipModule,
  ValidationModule
]);

bootstrapApplication(AppComponent, APP_CONFIG).catch(err => console.error(err));
