/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ElementRef, Injectable } from '@angular/core';

@Injectable()
export abstract class SiLivePreviewWebComponentService {
  abstract injectComponent(element: ElementRef, inputs?: any, outputs?: any): any;
  abstract destroyComponent(): void;
}
