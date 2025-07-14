/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalRef } from '@siemens/element-ng/modal';

import { SiConfirmationDialogComponent } from './si-confirmation-dialog.component';

describe('SiConfirmationDialogComponent', () => {
  let component: SiConfirmationDialogComponent;
  let fixture: ComponentFixture<SiConfirmationDialogComponent>;
  let element: HTMLElement;
  let modalRef: ModalRef<any, any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiConfirmationDialogComponent],
      providers: [ModalRef]
    }).compileComponents();
    modalRef = TestBed.inject(ModalRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiConfirmationDialogComponent);
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

  it('should emit result on decline', () => {
    expect(component).toBeTruthy();
    spyOn(modalRef, 'hide');
    element.querySelector<HTMLElement>('.btn-secondary')?.click();
    expect(modalRef.hide).toHaveBeenCalledWith('decline');
  });
});
