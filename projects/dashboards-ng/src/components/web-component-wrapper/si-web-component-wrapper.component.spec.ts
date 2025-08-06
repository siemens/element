/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DeleteConfirmationDialogResult,
  SiActionDialogService
} from '@spike-rabbit/element-ng/action-modal';
import { Observable, Subject } from 'rxjs';

import { SiGridService } from '../../services/si-grid.service';
import { SiWebComponentWrapperComponent } from './si-web-component-wrapper.component';

class SiActionDialogMockService {
  result = new Subject<DeleteConfirmationDialogResult>();

  showDeleteConfirmationDialog(args: any[]): Observable<DeleteConfirmationDialogResult> {
    return this.result;
  }
}

describe('SiWidgetHostComponent', () => {
  let component: SiWebComponentWrapperComponent;
  let fixture: ComponentFixture<SiWebComponentWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiWebComponentWrapperComponent],
      providers: [
        { provide: SiActionDialogService, useClass: SiActionDialogMockService },
        SiGridService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWebComponentWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
