/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'si-image-cropper-style',
  template: '<ng-content />',
  styleUrl: './si-image-cropper-style.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiImageCropperStyleComponent {}
