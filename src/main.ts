/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { InfiniteRowModelModule, ModuleRegistry, RowDragModule } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule } from 'ag-grid-enterprise';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

ModuleRegistry.registerModules([
  AllEnterpriseModule,
  RowDragModule,
  RowGroupingModule,
  InfiniteRowModelModule
]);
bootstrapApplication(AppComponent, APP_CONFIG).catch(err => console.error(err));
