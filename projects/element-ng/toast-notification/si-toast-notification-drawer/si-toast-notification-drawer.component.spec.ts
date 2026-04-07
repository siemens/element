/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SI_TOAST_TOKEN } from '../si-toast-token.model';
import { SiToast } from '../si-toast.model';
import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer.component';

describe('SiToastNotificationDrawerComponent', () => {
  let toasts: WritableSignal<SiToast[]>;
  let fixture: ComponentFixture<SiToastNotificationDrawerComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    toasts = signal([]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SI_TOAST_TOKEN,
          useValue: {
            toasts,
            pause: () => {},
            resume: () => {}
          }
        }
      ]
    });
    fixture = TestBed.createComponent(SiToastNotificationDrawerComponent);
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
    expect(domToasts.length).toBe(2);
    expect(domToasts[0]).toHaveTextContent('danger message');
    expect(domToasts[1]).toHaveTextContent('info message');
  });
});
