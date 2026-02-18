/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { StatusType } from '@siemens/element-ng/common';

@Component({
  selector: 'app-test',
  template: `
    <button (click)="showToast()">Show Toast</button>
  `
})
export class TestComponent {

  constructor(private toastService: SiToastNotificationService) {}

  showToast(): void {
    const state: StatusType = 'success';
    const anotherState: StatusType = 'error';
  }

  getToastState(): StatusType {
    return 'warning';
  }

  processState(state: StatusType): void {
    console.log(state);
  }
}
