/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiFileDropzoneComponent, UploadFile } from '@siemens/element-ng/file-uploader';

@Component({
  selector: 'app-sample',
  templateUrl: './si-file-dropzone.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFileDropzoneComponent]
})
export class SampleComponent {
  maxFileSizeInBytes = 524_288; // 0.5mb
  files: UploadFile[] = [];
}
