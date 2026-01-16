/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';

platformBrowser()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
