/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ToastStateName , SiToastNotificationService } from '@siemens/element-ng/toast-notification';

@Component({
  selector: 'app-test',
  template: `
    <button (click)="showToast()">Show Toast</button>
  `
})
export class TestComponent {

  constructor(private toastService: SiToastNotificationService) {}

  showToast(): void {
    const state: ToastStateName = 'success';
    const anotherState: ToastStateName = 'error';
  }

  getToastState(): ToastStateName {
    return 'warning';
  }

  processState(state: ToastStateName): void {
    console.log(state);
  }
}
