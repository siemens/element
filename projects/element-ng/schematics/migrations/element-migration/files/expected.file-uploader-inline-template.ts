import { Component } from '@angular/core';
import { SiFileUploaderComponent, SiFileDropzoneComponent } from '@siemens/element-ng/file-uploader';

@Component({
  selector: 'si-migration',
  imports: [SiFileUploaderComponent, SiFileDropzoneComponent],
  template: `<si-file-uploader  [maxFileSize]="5000000">
      </si-file-uploader>
      <si-file-dropzone  (filesChanged)="onFilesChanged($event)">
      </si-file-dropzone>`
})
export class TemplateComponent {}
