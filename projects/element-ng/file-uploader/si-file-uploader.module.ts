/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiFileDropzoneComponent } from './si-file-dropzone.component';
import { SiFileUploadDirective } from './si-file-upload.directive';
import { SiFileUploaderComponent } from './si-file-uploader.component';

@NgModule({
  imports: [SiFileDropzoneComponent, SiFileUploaderComponent, SiFileUploadDirective],
  exports: [SiFileDropzoneComponent, SiFileUploaderComponent, SiFileUploadDirective]
})
export class SiFileUploaderModule {}
