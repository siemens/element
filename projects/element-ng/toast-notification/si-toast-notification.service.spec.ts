/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { SiToastNotificationService } from './si-toast-notification.service';

describe('SiToastNotificationService', () => {
  let service: SiToastNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiToastNotificationService]
    });
  });

  beforeEach(() => (service = TestBed.inject(SiToastNotificationService)));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully queue a toast notification', () => {
    service.queueToastNotification('success', 'Success!', 'A successful event has occurred.');
    const activeToast = service.activeToasts[0];
    expect(activeToast.state).toEqual('success');
    expect(activeToast.title).toEqual('Success!');
    expect(activeToast.message).toEqual('A successful event has occurred.');
  });

  it('should successfully hide all toast notifications', () => {
    service.queueToastNotification('success', 'Success!', 'A successful event has occurred.');
    service.hideToastNotification();
    expect(service.activeToasts.length).toBe(0);
  });

  it('should close a toast', () => {
    const toast = service.queueToastNotification(
      'success',
      'Success!',
      'A successful event has occurred.'
    );
    spyOn(toast.hidden!, 'next');
    expect(service.activeToasts.length).toBe(1);

    toast.close!();

    expect(service.activeToasts.length).toBe(0);
    expect(toast.hidden?.next).toHaveBeenCalled();
  });

  it('should queue a maximum of three toasts', fakeAsync(() => {
    service.queueToastNotification('success', 'Toast 1', 'Message 1');
    service.queueToastNotification('success', 'Toast 2', 'Message 2');
    service.queueToastNotification('success', 'Toast 3', 'Message 3');
    service.queueToastNotification('success', 'Toast 4', 'Message 4');

    expect(service.activeToasts.length).toBe(3);
    expect(service.activeToasts[0].message).toBe('Message 2'); // first one is dropped
    flush();
  }));

  it('automatically closes toast after a while', fakeAsync(() => {
    service.queueToastNotification('success', 'Toast 1', 'Message 1');
    expect(service.activeToasts.length).toBe(1);

    tick(6000);

    expect(service.activeToasts.length).toBe(0);
  }));

  it('should respect the disableAutoClose flag', fakeAsync(() => {
    service.queueToastNotification('success', 'Toast 1', 'Message 1', true);
    expect(service.activeToasts.length).toBe(1);

    tick(6000);

    expect(service.activeToasts.length).toBe(1);
  }));
});
