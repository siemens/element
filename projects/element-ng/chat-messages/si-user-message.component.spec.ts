/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { injectMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';

import { MessageAction } from './message-action.model';
import { Attachment } from './si-attachment-list.component';
import { SiUserMessageComponent as TestComponent } from './si-user-message.component';

describe('SiUserMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let markdownRenderer: (text: string) => string | Node;
  let content: WritableSignal<string>;
  let contentFormatter: WritableSignal<((text: string) => string | Node) | undefined>;
  let actions: WritableSignal<MessageAction[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let attachments: WritableSignal<Attachment[]>;
  let actionParam: WritableSignal<unknown>;

  beforeEach(() => {
    content = signal('');
    contentFormatter = signal<((text: string) => string | Node) | undefined>(undefined);
    actions = signal<MessageAction[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    attachments = signal<Attachment[]>([]);
    actionParam = signal<unknown>(undefined);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('content', content),
        inputBinding('contentFormatter', contentFormatter),
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('attachments', attachments),
        inputBinding('actionParam', actionParam)
      ]
    });
    debugElement = fixture.debugElement;
    markdownRenderer = TestBed.runInInjectionContext(() => injectMarkdownRenderer());
  });

  it('should render markdown content', async () => {
    content.set('This is my **message**');
    contentFormatter.set(markdownRenderer);
    await fixture.whenStable();

    const markdownContent = fixture.nativeElement.querySelector('.markdown-content') as HTMLElement;
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.textContent).toBeTruthy();
  });

  it('should use end alignment for chat message', async () => {
    await fixture.whenStable();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.alignment()).toBe('end');
  });

  it('should render action buttons when actions are provided', async () => {
    actions.set([
      {
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Edit');
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
        label: 'Delete',
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
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      },
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(2);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Edit');
    expect(actionButtons[1]).toHaveAttribute('aria-label', 'Copy');
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
        label: 'Edit',
        icon: 'element-edit',
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

  it('should not render attachment list when no attachments', async () => {
    attachments.set([]);
    await fixture.whenStable();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeFalsy();
  });

  it('should render attachment list when attachments are provided', async () => {
    attachments.set([{ name: 'file1.txt' }, { name: 'file2.pdf' }]);
    await fixture.whenStable();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeTruthy();
  });
});
