/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ApplicationRef } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { SiActionDialogService } from './si-action-dialog.service';
import type { DeleteConfirmationDialogResult } from './si-action-dialog.types';

describe('SiActionDialogService', () => {
  let service: SiActionDialogService;
  let appRef!: ApplicationRef;

  const clickDialogButton = (index: number): void => {
    appRef.tick();
    flush();
    document.querySelectorAll<HTMLElement>('si-modal button:not(.btn-circle)')[index]?.click();
    appRef.tick();
    flush();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] }).compileComponents();
    service = TestBed.inject(SiActionDialogService);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show alert dialog with all options and confirm', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'alert',
      message: 'This is an alert.',
      heading: 'Title',
      confirmBtnName: 'Got It'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('confirm');
    });
    clickDialogButton(0);
    subscription.unsubscribe();
  }));

  it('should show alert dialog with no options and confirm', fakeAsync(() => {
    const observable = service.showActionDialog({ type: 'alert', message: 'This is an alert.' });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('confirm');
    });
    clickDialogButton(0);
    subscription.unsubscribe();
  }));

  it('should show confirmation dialog and confirm', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'confirmation',
      message: 'This is an alert.',
      heading: 'Title',
      confirmBtnName: 'Got It'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('confirm');
    });

    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show confirmation dialog with all options and confirm', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'confirmation',
      message: 'This is an alert.',
      heading: 'Title',
      confirmBtnName: 'Got It'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('confirm');
    });
    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show confirmation dialog with no options and confirm', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'confirmation',
      message: 'This is an alert.'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('confirm');
    });
    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show confirmation dialog and decline', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'confirmation',
      message: 'Question.',
      heading: 'Title',
      confirmBtnName: 'Confirm',
      declineBtnName: 'Decline'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('decline');
    });
    clickDialogButton(0);
    subscription.unsubscribe();
  }));

  it('should show edit-discard dialog with all options and save', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'edit-discard',
      disableSave: false,
      message: 'This is an alert.',
      heading: 'Title',
      saveBtnName: 'Save',
      discardBtnName: 'NotSave',
      cancelBtnName: 'Cancel'
    });

    const subscription = observable.subscribe(result => {
      expect(result).toBe('save');
    });
    clickDialogButton(2);
    subscription.unsubscribe();
  }));

  it('should show edit-discard dialog with no options and save', fakeAsync(() => {
    const observable = service.showActionDialog({ type: 'edit-discard' });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('save');
    });
    clickDialogButton(2);
    subscription.unsubscribe();
  }));

  it('should show edit-discard dialog and discard', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'edit-discard',
      disableSave: false,
      message: 'This is an alert.',
      heading: 'Title',
      saveBtnName: 'Save',
      discardBtnName: 'NotSave',
      cancelBtnName: 'Cancel'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('discard');
    });
    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show edit-discard dialog and cancel', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'edit-discard',
      disableSave: false,
      message: 'This is an alert.',
      heading: 'Title',
      saveBtnName: 'Save',
      discardBtnName: 'NotSave',
      cancelBtnName: 'Cancel'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('cancel');
    });
    clickDialogButton(0);
    subscription.unsubscribe();
  }));

  it('should show delete confirmation with all options dialog and delete', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'delete-confirm',
      message: 'This is an alert.',
      heading: 'Title',
      deleteBtnName: 'Delete',
      cancelBtnName: 'Cancel'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('delete');
    });
    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show delete confirmation with no options dialog and delete', fakeAsync(() => {
    const observable = service.showActionDialog({ type: 'delete-confirm' });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('delete');
    });
    clickDialogButton(1);
    subscription.unsubscribe();
  }));

  it('should show delete confirmation dialog and cancel', fakeAsync(() => {
    const observable = service.showActionDialog({
      type: 'delete-confirm',
      message: 'This is an alert.',
      heading: 'Title',
      deleteBtnName: 'Delete',
      cancelBtnName: 'Cancel'
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('cancel');
    });
    clickDialogButton(0);
    subscription.unsubscribe();
  }));

  it('should delay closing until delayDismiss() completes', fakeAsync(() => {
    const delaySubject = new Subject<DeleteConfirmationDialogResult>();
    const observable = service.showActionDialog({
      type: 'delete-confirm',
      delayDismiss: () => delaySubject
    });
    const subscription = observable.subscribe(result => {
      expect(result).toBe('delete');
    });
    clickDialogButton(1);

    flush();
    expect(document.querySelector('si-modal si-loading-button si-loading-spinner')).toBeTruthy();
    delaySubject.next('delete');
    delaySubject.complete();
    flush();

    subscription.unsubscribe();
  }));
});
