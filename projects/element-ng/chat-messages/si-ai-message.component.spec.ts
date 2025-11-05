/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

import { MessageAction } from './message-action.model';
import { SiAiMessageComponent as TestComponent } from './si-ai-message.component';

describe('SiAiMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let markdownRenderer: (text: string) => string | Node;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    const sanitizer = TestBed.inject(DomSanitizer);
    markdownRenderer = getMarkdownRenderer(sanitizer);
  });

  it('should render markdown content', () => {
    const content = 'This is **bold** text';
    fixture.componentRef.setInput('content', content);
    fixture.componentRef.setInput('contentFormatter', markdownRenderer);
    fixture.detectChanges();

    const markdownContent = fixture.nativeElement.querySelector('.markdown-content') as HTMLElement;
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.textContent).toBeTruthy();
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

  it('should render action buttons when actions are provided', () => {
    const actions: MessageAction[] = [
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0].getAttribute('aria-label')).toBe('Copy');
  });

  it('should not render action buttons when no actions and no secondary actions', () => {
    fixture.componentRef.setInput('actions', []);
    fixture.componentRef.setInput('secondaryActions', []);
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(0);
  });

  it('should render secondary actions menu trigger', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        label: 'Bookmark',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const menuTrigger = fixture.nativeElement.querySelector('button.cdk-menu-trigger');
    expect(menuTrigger).toBeTruthy();
  });

  it('should render all action buttons', () => {
    const actions: MessageAction[] = [
      {
        label: 'Thumbs Up',
        icon: 'element-thumbs-up',
        action: () => {}
      },
      {
        label: 'Thumbs Down',
        icon: 'element-thumbs-down',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(2);
    expect(actionButtons[0].getAttribute('aria-label')).toBe('Thumbs Up');
    expect(actionButtons[1].getAttribute('aria-label')).toBe('Thumbs Down');
  });

  it('should render secondary actions menu', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const menuTrigger = fixture.nativeElement.querySelector('button.cdk-menu-trigger');
    expect(menuTrigger).toBeTruthy();
  });

  it('should call action with actionParam', () => {
    const actionSpy = jasmine.createSpy('action');
    const actions: MessageAction[] = [
      {
        label: 'Copy',
        icon: 'element-export',
        action: actionSpy
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('actionParam', 'test-param');
    fixture.detectChanges();

    const actionButton = fixture.nativeElement.querySelector('[siChatMessageAction] button');
    actionButton.click();

    expect(actionSpy).toHaveBeenCalledWith('test-param', actions[0]);
  });

  it('should show loading skeleton when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.loading()).toBe(true);
  });

  it('should hide action buttons when loading', () => {
    const actions: MessageAction[] = [
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(0);
  });
});
