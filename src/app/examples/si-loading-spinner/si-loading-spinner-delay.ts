/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import {
  SiLoadingService,
  SiLoadingSpinnerDirective
} from '@spike-rabbit/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiCardComponent, SiLoadingSpinnerDirective],
  templateUrl: './si-loading-spinner-delay.html'
})
export class SampleComponent {
  protected loadingService = inject(SiLoadingService);
  initialDelay = true;
  blockingSpinner = true;

  start(): void {
    this.loadingService.startLoad();
  }

  stop(): void {
    this.loadingService.stopLoad();
  }

  delay(): void {
    this.initialDelay = !this.initialDelay;
  }

  blocking(): void {
    this.blockingSpinner = !this.blockingSpinner;
  }
}
