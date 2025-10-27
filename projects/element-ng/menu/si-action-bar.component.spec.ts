/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiMenuActionService } from '@siemens/element-ng/menu';

import { SiActionBarComponent as TestComponent, ActionBarItem } from './si-action-bar.component';

describe('SiActionBarComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [SiMenuActionService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty action bar when no actions provided', () => {
    fixture.componentRef.setInput('actions', []);
    fixture.componentRef.setInput('secondaryActions', []);
    fixture.detectChanges();

    const buttons = debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(0);
  });

  it('should render primary actions', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const buttons = debugElement.queryAll(By.css('button.btn-circle'));
    expect(buttons.length).toBe(2);
  });

  it('should call action function when button is clicked', () => {
    const actionSpy = jasmine.createSpy('action');
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: actionSpy
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('actionParam', 'test-param');
    fixture.detectChanges();

    const button = debugElement.query(By.css('button.btn-circle'));
    button.nativeElement.click();

    expect(actionSpy).toHaveBeenCalledWith('test-param', actions[0]);
  });

  it('should render dropdown actions when provided', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        icon: 'element-delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const allButtons = debugElement.queryAll(By.css('button.btn-circle'));
    expect(allButtons.length).toBe(1); // 1 dropdown trigger button
  });

  it('should render both primary and dropdown actions', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        icon: 'element-delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const allButtons = debugElement.queryAll(By.css('button.btn-circle'));
    expect(allButtons.length).toBe(2); // 1 primary + 1 dropdown trigger
  });

  it('should use custom secondary actions label', () => {
    const customLabel = 'Custom More Actions';
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ]);
    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.componentRef.setInput('secondaryActionsLabel', customLabel);
    fixture.detectChanges();

    const buttons = debugElement.queryAll(By.css('button.btn-circle'));
    const menuTrigger = buttons[buttons.length - 1]; // Last button should be the dropdown trigger
    expect(menuTrigger.nativeElement.getAttribute('aria-label')).toBe(customLabel);
  });

  it('should use custom dropdown actions label when no primary actions', () => {
    const customLabel = 'Custom Show Actions';
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.componentRef.setInput('secondaryActionsLabel', customLabel);
    fixture.detectChanges();

    const triggerButton = debugElement.queryAll(By.css('button.btn-circle'))[0];
    expect(triggerButton.nativeElement.getAttribute('aria-label')).toContain(customLabel);
  });

  it('should trigger string action through menu action service', () => {
    const menuActionService = TestBed.inject(SiMenuActionService);
    const actionTriggeredSpy = jasmine.createSpy('actionTriggered');
    (menuActionService as any).actionTriggered = actionTriggeredSpy;

    const actions: ActionBarItem[] = [
      {
        id: 'custom',
        label: 'Custom',
        icon: 'element-export',
        action: 'customAction'
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('actionParam', 'test-param');
    fixture.detectChanges();

    const button = debugElement.query(By.css('button.btn-circle'));
    button.nativeElement.click();

    expect(actionTriggeredSpy).toHaveBeenCalledWith(
      { type: 'action', ...actions[0] } as any,
      'test-param'
    );
  });
});
