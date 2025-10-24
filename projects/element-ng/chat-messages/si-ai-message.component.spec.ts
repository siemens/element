/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ActionBarItem } from './si-action-bar.component';
import { SiAiMessageComponent as TestComponent } from './si-ai-message.component';

describe('SiAiMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty content', () => {
    fixture.detectChanges();
    expect(component.content()).toBe('');
  });

  it('should have default loading state of false', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should have default empty actions array', () => {
    fixture.detectChanges();
    expect(component.actions()).toEqual([]);
  });

  it('should have default empty secondary actions array', () => {
    fixture.detectChanges();
    expect(component.secondaryActions()).toEqual([]);
  });

  it('should render markdown content', () => {
    const content = 'This is **bold** text';
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    const markdownContent = debugElement.query(By.css('si-markdown-content'));
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.componentInstance.content()).toBe(content);
  });

  it('should pass loading state to chat message', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.loading()).toBe(true);
  });

  it('should use start alignment for chat message', () => {
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.alignment()).toBe('start');
  });

  it('should render action bar when actions are provided', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeTruthy();
  });

  it('should not render action bar when no actions and no secondary actions', () => {
    fixture.componentRef.setInput('actions', []);
    fixture.componentRef.setInput('secondaryActions', []);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeFalsy();
  });

  it('should render action bar with secondary actions', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'bookmark',
        label: 'Bookmark',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeTruthy();
  });

  it('should pass actions to action bar', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'thumbsup',
        label: 'Thumbs Up',
        icon: 'element-thumbs-up',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.actions()).toEqual(actions);
  });

  it('should pass secondary actions to action bar as dropdownActions', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.dropdownActions()).toEqual(secondaryActions);
  });

  it('should pass actionParam to action bar', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('actionParam', 'test-param');
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.actionParam()).toBe('test-param');
  });

  it('should use custom secondaryActionsLabel', () => {
    const customLabel = 'Custom More Actions';
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('secondaryActions', [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ]);
    fixture.componentRef.setInput('secondaryActionsLabel', customLabel);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.secondaryActionsLabel()).toBe(customLabel);
  });

  it('should show loading skeleton when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.loading()).toBe(true);
  });

  it('should hide action bar when loading', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeFalsy();
  });

  it('should have si-ai-message host class', () => {
    fixture.detectChanges();
    expect(debugElement.nativeElement.classList.contains('si-ai-message')).toBe(true);
  });
});
