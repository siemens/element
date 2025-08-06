/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalRef } from '@spike-rabbit/element-ng/modal';

import { SiDeleteConfirmationDialogComponent } from './si-delete-confirmation-dialog.component';

describe('SiDeleteConfirmationDialogComponent', () => {
  let component: SiDeleteConfirmationDialogComponent;
  let fixture: ComponentFixture<SiDeleteConfirmationDialogComponent>;
  let element: HTMLElement;
  let modalRef: ModalRef<any, any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiDeleteConfirmationDialogComponent],
      providers: [ModalRef]
    });
    modalRef = TestBed.inject(ModalRef);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiDeleteConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit result on delete', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-danger')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('delete');
  });

  it('should emit result on cancel', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-secondary')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('cancel');
  });
});
