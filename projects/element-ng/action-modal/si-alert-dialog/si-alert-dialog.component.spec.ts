/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalRef } from '@spike-rabbit/element-ng/modal';

import { SiAlertDialogComponent } from './si-alert-dialog.component';

describe('SiAlertDialogComponent', () => {
  let component: SiAlertDialogComponent;
  let fixture: ComponentFixture<SiAlertDialogComponent>;
  let element: HTMLElement;
  let modalRef: ModalRef<any, any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiAlertDialogComponent],
      providers: [ModalRef]
    }).compileComponents();
    modalRef = TestBed.inject(ModalRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit result on confirm', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-primary')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('confirm');
  });
});
