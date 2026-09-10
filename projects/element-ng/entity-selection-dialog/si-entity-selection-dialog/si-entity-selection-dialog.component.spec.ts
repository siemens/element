/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SiSearchBarModule } from '@simpl/element-ng';

import { SiEntitySelectionDialogComponent } from './si-entity-selection-dialog.component';

describe('SiEntitySelectionDialogComponent', () => {
  let component: SiEntitySelectionDialogComponent;
  let fixture: ComponentFixture<SiEntitySelectionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SiEntitySelectionDialogComponent],
      imports: [NgxDatatableModule, SiSearchBarModule, TranslateModule.forRoot()],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiEntitySelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit undefined on closeModalDialog', (done: DoneFn) => {
    component.closeModal.subscribe((result: string | undefined) => {
      expect(result).toBe(undefined);
      done();
    });
    component.closeModalDialog();
  });

  it('should emit selectables on save', () => {
    spyOn(component.closeModal, 'emit');
    const selectables = [{ id: '123', title: '123' }];
    component.onSelect(selectables);
    component.saveModal();
    expect(component.closeModal.emit).toHaveBeenCalledWith(selectables);
  });

  it('should emit undefined on cancel', () => {
    spyOn(component.closeModal, 'emit');
    const selectables = [{ id: '123', title: '123' }];
    component.onSelect(selectables);
    component.closeModalDialog();
    expect(component.closeModal.emit).toHaveBeenCalledWith(undefined);
  });

  it('should assign searched string', () => {
    const search = 'test';
    component.searchText(search);
    expect(component.searchString).toEqual('test');
  });
});
