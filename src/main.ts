/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { SiLoadingSpinnerModule } from '@siemens/element-ng/loading-spinner';
import {
  ClientSideRowModelModule,
  InfiniteRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  RowDragModule,
  RowSelectionModule,
  TextFilterModule,
  TooltipModule,
  ValidationModule
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
  PaginationModule,
  ValidationModule
]);

bootstrapApplication(AppComponent, APP_CONFIG).catch(err => console.error(err));
