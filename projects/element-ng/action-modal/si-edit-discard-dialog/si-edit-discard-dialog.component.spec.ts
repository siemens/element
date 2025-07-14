/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalRef } from '@siemens/element-ng/modal';

import { SiEditDiscardDialogComponent } from './si-edit-discard-dialog.component';

describe('SiEditDiscardDialogComponent', () => {
  let component: SiEditDiscardDialogComponent;
  let fixture: ComponentFixture<SiEditDiscardDialogComponent>;
  let element: HTMLElement;
  let modalRef: ModalRef<any, any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiEditDiscardDialogComponent],
      providers: [ModalRef]
    }).compileComponents();
    modalRef = TestBed.inject(ModalRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiEditDiscardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit result on save', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-primary')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('save');
  });

  it('should emit result on discard', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-danger')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('discard');
  });

  it('should emit result on cancel', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-secondary')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('cancel');
  });
});
