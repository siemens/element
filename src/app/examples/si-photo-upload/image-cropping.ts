/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiImageCropperStyleComponent } from '@siemens/element-ng/photo-upload';
import { LOG_EVENT } from '@siemens/live-preview';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-sample',
  imports: [ImageCropperComponent, SiImageCropperStyleComponent],
  templateUrl: './image-cropping.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'p-5' }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected imageSource = 'assets/images/beach.jpg';

  protected onImageCropped(event: ImageCroppedEvent): void {
    this.logEvent('Image cropped', event);
  }
}
