/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiDashboardToolbarComponent } from './si-dashboard-toolbar.component';

describe('SiDashboardToolbarComponent', () => {
  let component: SiDashboardToolbarComponent;
  let fixture: ComponentFixture<SiDashboardToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, SiDashboardToolbarComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiDashboardToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onEdit() shall set editable mode', fakeAsync(() => {
    expect(component.editable()).toBeFalse();
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    expect(component.editable()).toBeTrue();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
  }));

  it('#onCancel() shall cancel editable mode', fakeAsync(() => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toContain('Cancel');

    buttons[0].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    expect(component.editable()).withContext('Cancel shall not change editable state').toBeTrue();
  }));

  it('#onSave() shall cancel editable mode and emit save', fakeAsync(() => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    expect(buttons[1].nativeElement.textContent).toContain('Save');

    buttons[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    expect(component.editable()).withContext('Save shall not change editable state').toBeTrue();
  }));

  it('#hideEditButton shall hide the edit button', () => {
    expect(component.editable()).toBeFalse();
    let editButton = fixture.debugElement.query(By.css('.element-edit'));
    expect(editButton).not.toBeNull();
    expect(editButton).toBeDefined();
    fixture.componentRef.setInput('hideEditButton', true);
    fixture.detectChanges();

    editButton = fixture.debugElement.query(By.css('.element-edit'));
    expect(editButton).toBeNull();
  });
});
