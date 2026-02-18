/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiColumnSelectionDialogService } from './si-column-selection-dialog.service';
import { ColumnSelectionDialogResult } from './si-column-selection-dialog.types';

describe('SiColumnSelectionDialogService', () => {
  let service: SiColumnSelectionDialogService;
  let appRef!: ApplicationRef;

  const clickSaveButton = (): void => {
    appRef.tick();
    document.querySelector<HTMLElement>('si-modal button.btn-primary')?.click();
    appRef.tick();
  };

  beforeEach(() => {
    service = TestBed.inject(SiColumnSelectionDialogService);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should show the column selection dialog', () => {
    const observable = service.showColumnSelectionDialog({
      heading: 'Column Dialog',
      bodyTitle: 'Select columns',
      submitBtnName: 'Save',
      cancelBtnName: 'Cancel',
      columns: []
    });
    const subscription = observable.subscribe((result: ColumnSelectionDialogResult) => {
      expect(result.type).toBe('ok');
    });
    clickSaveButton();
    subscription.unsubscribe();
  });
});
