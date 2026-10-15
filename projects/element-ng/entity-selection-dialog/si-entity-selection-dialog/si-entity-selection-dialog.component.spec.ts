/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Mock, vi } from 'vitest';

import { PageRequest } from '../pagination';
import {
  Selectable,
  SiEntitySelectionDialogComponent
} from './si-entity-selection-dialog.component';

describe('SiEntitySelectionDialogComponent', () => {
  let fixture: ComponentFixture<SiEntitySelectionDialogComponent>;
  let element: HTMLElement;
  const selectables = [{ id: '123', title: 'Entity 123' }];
  let closeModal: Mock<(result: Selectable[] | undefined) => void>;
  let pageRequests: Subject<PageRequest | undefined>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiEntitySelectionDialogComponent]
    }).compileComponents();
    closeModal = vi.fn();
    pageRequests = new Subject<PageRequest | undefined>();
    fixture = TestBed.createComponent(SiEntitySelectionDialogComponent, {
      bindings: [
        inputBinding('modalTitle', () => 'Select an entity'),
        inputBinding('modalSave', () => 'Save'),
        inputBinding('modalCancel', () => 'Cancel'),
        inputBinding('pagedData', () =>
          of({
            data: selectables,
            page: { pageNumber: 0, size: 1, totalElements: 1, totalPages: 1 }
          })
        ),
        inputBinding('pageRequests', () => pageRequests),
        outputBinding('closeModal', closeModal)
      ]
    });
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the dialog title', () => {
    expect(element.querySelector('.modal-title')?.textContent).toBe('Select an entity');
  });

  it('emits undefined when closed', () => {
    element.querySelector<HTMLButtonElement>('.btn-close')!.click();
    expect(closeModal).toHaveBeenCalledWith(undefined);
  });

  it('disables save until an entity is selected', () => {
    expect(element.querySelector<HTMLButtonElement>('.btn-primary')!.disabled).toBe(true);
  });

  it('emits selected entities when saved', async () => {
    fixture.componentInstance.onSelect(selectables);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    expect(closeModal).toHaveBeenCalledWith(selectables);
  });

  it('emits undefined when canceled', () => {
    element.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    expect(closeModal).toHaveBeenCalledWith(undefined);
  });

  it('requests the first page for a trimmed search term', () => {
    const request = vi.fn();
    pageRequests.subscribe(request);
    fixture.componentInstance.searchText(' test ');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ pageNumber: 0, search: 'test' })
    );
  });
});
