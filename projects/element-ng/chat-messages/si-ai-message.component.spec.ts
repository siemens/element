/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';

import { MessageAction } from './message-action.model';
import { SiAiMessageComponent as TestComponent } from './si-ai-message.component';

describe('SiAiMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let markdownRenderer: (text: string) => string | Node;
  let content: WritableSignal<string>;
  let contentFormatter: WritableSignal<((text: string) => string | Node) | undefined>;
  let loading: WritableSignal<boolean>;
  let actions: WritableSignal<MessageAction[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let actionParam: WritableSignal<unknown>;

  beforeEach(() => {
    content = signal('');
    contentFormatter = signal<((text: string) => string | Node) | undefined>(undefined);
    loading = signal(false);
    actions = signal<MessageAction[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    actionParam = signal<unknown>(undefined);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('content', content),
        inputBinding('contentFormatter', contentFormatter),
        inputBinding('loading', loading),
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('actionParam', actionParam)
      ]
    });
    debugElement = fixture.debugElement;
    const sanitizer = TestBed.inject(DomSanitizer);
    const doc = TestBed.inject(DOCUMENT);
    markdownRenderer = getMarkdownRenderer(sanitizer, undefined, doc, true);
  });

  it('should render markdown content', async () => {
    content.set('This is **bold** text');
    contentFormatter.set(markdownRenderer);
    await fixture.whenStable();

    const markdownContent = fixture.nativeElement.querySelector('.markdown-content') as HTMLElement;
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.textContent).toBeTruthy();
  });

  it('should pass loading state to chat message', async () => {
    loading.set(true);
    await fixture.whenStable();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.loading()).toBe(true);
  });

  it('should use start alignment for chat message', async () => {
    await fixture.whenStable();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.alignment()).toBe('start');
  });

  it('should render action buttons when actions are provided', async () => {
    actions.set([
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Copy');
  });

  it('should not render action buttons when no actions and no secondary actions', async () => {
    actions.set([]);
    secondaryActions.set([]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(0);
  });

  it('should render secondary actions menu trigger', async () => {
    secondaryActions.set([
      {
        type: 'action' as const,
        label: 'Bookmark',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const menuTrigger = fixture.nativeElement.querySelector('button.cdk-menu-trigger');
    expect(menuTrigger).toBeTruthy();
  });

  it('should render all action buttons', async () => {
    actions.set([
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
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(2);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Thumbs Up');
    expect(actionButtons[1]).toHaveAttribute('aria-label', 'Thumbs Down');
  });

  it('should render secondary actions menu', async () => {
    secondaryActions.set([
      {
        type: 'action' as const,
        label: 'Delete',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const menuTrigger = fixture.nativeElement.querySelector('button.cdk-menu-trigger');
    expect(menuTrigger).toBeTruthy();
  });

  it('should call action with actionParam', async () => {
    const actionSpy = vi.fn();
    const testActions: MessageAction[] = [
      {
        label: 'Copy',
        icon: 'element-export',
        action: actionSpy
      }
    ];

    actions.set(testActions);
    actionParam.set('test-param');
    await fixture.whenStable();

    const actionButton = fixture.nativeElement.querySelector('[siChatMessageAction] button');
    actionButton.click();

    expect(actionSpy).toHaveBeenCalledWith('test-param', testActions[0]);
  });

  it('should show loading skeleton when loading is true', async () => {
    loading.set(true);
    await fixture.whenStable();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.loading()).toBe(true);
  });

  it('should hide action buttons when loading', async () => {
    actions.set([
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ]);
    loading.set(true);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(0);
  });
});
