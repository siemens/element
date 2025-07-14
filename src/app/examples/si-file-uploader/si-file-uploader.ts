/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadConfig, SiFileUploaderComponent } from '@siemens/element-ng/file-uploader';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { LOG_EVENT } from '@siemens/live-preview';

import { FileUploadInterceptor } from './file-upload-interceptor';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFileUploaderComponent, SiFormItemComponent, SiNumberInputComponent],
  templateUrl: './si-file-uploader.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly fileUploadInterceptor = inject(FileUploadInterceptor);
  readonly uploadConfig: FileUploadConfig = {
    method: 'POST',
    url: 'api/file-upload',

    headers: new HttpHeaders({ 'Accept': 'application/json' }),
    fieldName: 'upload_file',
    responseType: 'json'
  };

  maxFileSizeInBytes = 524_288; // 0.5mb
  showHttpError = false;
  hasMaxHeight = false;
  autoUpload = false;
  directoryUpload = false;
  maxFiles = 10;
  maxConcurrentUploads = 3;
}
