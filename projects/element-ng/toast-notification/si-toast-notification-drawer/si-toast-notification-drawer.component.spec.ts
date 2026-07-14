/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiToast } from '../si-toast.model';
import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer.component';

describe('SiToastNotificationDrawerComponent', () => {
  let toasts: WritableSignal<SiToast[]>;
  let fixture: ComponentFixture<SiToastNotificationDrawerComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    toasts = signal([]);
    fixture = TestBed.createComponent(SiToastNotificationDrawerComponent, {
      bindings: [
        inputBinding('toasts', toasts),
        outputBinding('toastPaused', () => {}),
        outputBinding('toastResumed', () => {})
      ]
    });
    element = fixture.nativeElement;
  });

  it('renders toasts', async () => {
    fixture.detectChanges();

    toasts.set([
      { state: 'danger', title: 'danger toast', message: 'danger message' },
      { state: 'info', title: 'info toast', message: 'info message' }
    ]);

    await fixture.whenStable();

    const domToasts = element.querySelectorAll('si-toast-notification');
    expect(domToasts).toHaveLength(2);
    expect(domToasts[0]).toHaveTextContent('danger message');
    expect(domToasts[1]).toHaveTextContent('info message');
  });
});
