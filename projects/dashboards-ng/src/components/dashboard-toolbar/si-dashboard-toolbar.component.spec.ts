/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiDashboardToolbarComponent } from './si-dashboard-toolbar.component';

describe('SiDashboardToolbarComponent', () => {
  let component: SiDashboardToolbarComponent;
  let fixture: ComponentFixture<SiDashboardToolbarComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiDashboardToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onEdit() shall set editable mode', async () => {
    expect(component.editable()).toBe(false);
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.editable()).toBe(true);
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
  });

  it('#onCancel() shall cancel editable mode', async () => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toContain('Cancel');

    buttons[0].triggerEventHandler('click', null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.editable()).toBe(false);
  });

  it('#onSave() shall cancel editable mode and emit save', async () => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    const loadingButton = fixture.debugElement.query(By.css('si-loading-button'));
    expect(buttons[1].nativeElement.textContent).toContain('Save');

    loadingButton.triggerEventHandler('click', null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.editable(), 'Save shall not change editable state').toBe(true);
  });

  it('#hideEditButton shall hide the edit button', () => {
    expect(component.editable()).toBe(false);
    let editButton = fixture.debugElement.query(By.css('.element-edit'));
    expect(editButton).not.toBeNull();
    expect(editButton).toBeDefined();
    fixture.componentRef.setInput('hideEditButton', true);
    fixture.detectChanges();

    editButton = fixture.debugElement.query(By.css('.element-edit'));
    expect(editButton).toBeNull();
  });
});
