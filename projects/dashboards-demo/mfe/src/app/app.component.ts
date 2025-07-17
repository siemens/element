/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

import { DownloadComponent } from './download.component';
import { UploadComponent } from './upload.component';

@Component({
  selector: 'app-root',
  imports: [DownloadComponent, UploadComponent],
  templateUrl: './app.component.html',
  styles: '.component-size {width: 200px; height: 200px}'
})
export class AppComponent {}
