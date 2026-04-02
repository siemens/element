/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SiAutoCollapsableListDirective } from '@siemens/element-ng/auto-collapsable-list';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../../../../element-ng/resize-observer/testing/resize-observer.mock';
import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
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

    expect(component.editable(), 'Cancel shall not change editable state').toBe(true);
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

describe('SiDashboardToolbarComponent responsive toolbar', () => {
  let fixture: ComponentFixture<SiDashboardToolbarComponent>;

  const actionItems: DashboardToolbarItem[] = [
    { type: 'action', label: 'Action 1', action: () => {} },
    { type: 'router-link', label: 'Router Link', routerLink: '/test' },
    { type: 'link', label: 'Link', href: 'https://example.com', target: '_blank' }
  ];

  const tick = async (ms = 100): Promise<void> => {
    vi.advanceTimersByTime(ms);
    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockResizeObserver();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(SiDashboardToolbarComponent);
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('primaryEditActions', actionItems);
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  const setContainerWidth = (width: number): void => {
    const listContainer: HTMLElement = fixture.debugElement.query(
      By.directive(SiAutoCollapsableListDirective)
    ).nativeElement;
    Object.defineProperty(listContainer, 'clientWidth', { value: width, configurable: true });
  };

  it('should show overflow button when there is not enough space for actions', async () => {
    fixture.detectChanges();
    await tick();

    setContainerWidth(50);
    MockResizeObserver.triggerResize({});
    await tick();
    fixture.detectChanges();

    const overflowButton: HTMLElement = fixture.debugElement.query(
      By.css('[aria-label="More actions"]')
    ).nativeElement;
    expect(overflowButton.style.visibility).toBe('visible');
  });

  it('should hide overflow button when there is enough space for actions', async () => {
    fixture.detectChanges();
    await tick();

    setContainerWidth(5000);
    MockResizeObserver.triggerResize({});
    await tick();
    fixture.detectChanges();

    const overflowButton: HTMLElement = fixture.debugElement.query(
      By.css('[aria-label="More actions"]')
    ).nativeElement;
    expect(overflowButton.style.visibility).toBe('hidden');
  });
});
