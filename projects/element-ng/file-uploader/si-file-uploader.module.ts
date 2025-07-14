/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiFileDropzoneComponent } from './si-file-dropzone.component';
import { SiFileUploaderComponent } from './si-file-uploader.component';

@NgModule({
  imports: [SiFileDropzoneComponent, SiFileUploaderComponent],
  exports: [SiFileDropzoneComponent, SiFileUploaderComponent]
})
export class SiFileUploaderModule {}
