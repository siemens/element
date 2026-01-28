/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  ChatMessage,
  MessageAction,
  SiAiChatContainerComponent
} from '@siemens/element-ng/chat-messages';

describe('SiAiChatContainerComponent', () => {
  let fixture: ComponentFixture<SiAiChatContainerComponent>;
  let debugElement: DebugElement;
  let component: SiAiChatContainerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiAiChatContainerComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SiAiChatContainerComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default sending state of false', () => {
    expect(component.sending()).toBe(false);
  });

  it('should have default loading state of false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should have default disableInterrupt state of false', () => {
    expect(component.disableInterrupt()).toBe(false);
  });

  it('should have default interrupting state of false', () => {
    expect(component.interrupting()).toBe(false);
  });

  it('should have default noAutoScroll of false', () => {
    expect(component.noAutoScroll()).toBe(false);
  });

  it('should have default empty messages array', () => {
    expect(component.messages()).toBeUndefined();
  });

  it('should have default colorVariant of base-0', () => {
    expect(component.colorVariant()).toBe('base-0');
  });

  it('should have default aiIcon of element-ai', () => {
    expect(component.aiIcon()).toBe('element-ai');
  });

  it('should render empty state when no messages', () => {
    fixture.componentRef.setInput('messages', []);
    fixture.detectChanges();

    const welcomeScreen = debugElement.query(By.css('si-ai-welcome-screen'));
    expect(welcomeScreen).toBeTruthy();
  });

  it('should not render empty state when messages exist', () => {
    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'Hello'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const welcomeScreen = debugElement.query(By.css('si-ai-welcome-screen'));
    expect(welcomeScreen).toBeFalsy();
  });

  it('should render user messages', () => {
    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'Hello'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessage = debugElement.query(By.css('si-user-message'));
    expect(userMessage).toBeTruthy();
  });

  it('should render AI messages', () => {
    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: 'Hello there!'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const aiMessage = debugElement.query(By.css('si-ai-message'));
    expect(aiMessage).toBeTruthy();
  });

  it('should render loading AI message when loading is true', () => {
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const aiMessages = debugElement.queryAll(By.css('si-ai-message'));
    expect(aiMessages.length).toBeGreaterThan(0);
  });

  it('should handle user message with attachments', () => {
    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'Here are some files',
        attachments: [{ name: 'file1.txt' }, { name: 'file2.pdf' }]
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessage = debugElement.query(By.css('si-user-message'));
    expect(userMessage.componentInstance.attachments().length).toBe(2);
  });

  it('should handle signal content in AI messages', () => {
    const contentSignal = signal('Streaming content...');
    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: contentSignal
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const aiMessage = debugElement.query(By.css('si-ai-message'));
    expect(aiMessage.componentInstance.content()).toBe('Streaming content...');
  });

  it('should compute inputInterruptible correctly', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', false);
    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(true);

    fixture.componentRef.setInput('interrupting', true);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('disableInterrupt', true);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(true);

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(false);
  });

  it('should compute inputSending correctly', () => {
    fixture.componentRef.setInput('sending', true);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);

    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', true);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);

    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(false);
  });

  it('should handle multiple message types in sequence', () => {
    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'Question'
      },
      {
        type: 'ai',
        content: 'Answer'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessages = debugElement.queryAll(By.css('si-user-message'));
    const aiMessages = debugElement.queryAll(By.css('si-ai-message'));

    expect(userMessages.length).toBe(1);
    expect(aiMessages.length).toBe(1);
  });

  it('should render welcome screen with custom greeting', () => {
    const customGreeting = 'Hello there!';
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('greeting', customGreeting);
    fixture.detectChanges();

    const welcomeScreen = debugElement.query(By.css('si-ai-welcome-screen'));
    expect(welcomeScreen.nativeElement.textContent).toContain(customGreeting);
  });

  it('should render welcome screen with custom welcome message', () => {
    const customMessage = 'How can I help you today?';
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('welcomeMessage', customMessage);
    fixture.detectChanges();

    const welcomeScreen = debugElement.query(By.css('si-ai-welcome-screen'));
    expect(welcomeScreen.nativeElement.textContent).toContain(customMessage);
  });

  it('should display prompt suggestions in welcome screen', () => {
    const suggestions = [{ text: 'What can you do?' }];
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('promptSuggestions', suggestions);
    fixture.detectChanges();

    const welcomeScreen = debugElement.query(By.css('si-ai-welcome-screen'));
    expect(welcomeScreen.nativeElement.textContent).toContain('What can you do?');
  });

  it('should handle AI message with actions', () => {
    const actions: MessageAction[] = [
      {
        label: 'Copy',
        icon: 'element-export',
        action: () => {}
      }
    ];

    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: 'AI response',
        actions
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const aiMessage = debugElement.query(By.css('si-ai-message'));
    expect(aiMessage.componentInstance.actions()).toEqual(actions);
  });

  it('should render status notification when statusSeverity is set', () => {
    fixture.componentRef.setInput('statusSeverity', 'warning');
    fixture.componentRef.setInput('statusMessage', 'Warning message');
    fixture.detectChanges();

    const notification = debugElement.query(By.css('si-inline-notification'));
    expect(notification).toBeTruthy();
  });

  it('should not render status notification when statusSeverity is not set', () => {
    fixture.detectChanges();

    const notification = debugElement.query(By.css('si-inline-notification'));
    expect(notification).toBeFalsy();
  });

  it('should have focus method', () => {
    expect(typeof component.focus).toBe('function');
  });

  it('should compute inputSending with both true', () => {
    fixture.componentRef.setInput('sending', true);
    fixture.componentRef.setInput('interrupting', true);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);
  });

  it('should not be interruptible when disableInterrupt is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', true);
    fixture.componentRef.setInput('sending', false);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(false);
  });

  it('should not be interruptible when sending is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', false);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(false);
  });

  it('should handle loading state with existing messages', () => {
    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'Question'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const aiMessages = debugElement.queryAll(By.css('si-ai-message'));
    expect(aiMessages.length).toBeGreaterThan(0);
  });

  it('should handle signal content updates', () => {
    const contentSignal = signal('Initial content');
    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: contentSignal
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const aiMessage = debugElement.query(By.css('si-ai-message'));
    expect(aiMessage.componentInstance.content()).toBe('Initial content');

    contentSignal.set('Updated content');
    fixture.detectChanges();

    expect(aiMessage.componentInstance.content()).toBe('Updated content');
  });

  it('should handle empty content signal', () => {
    const contentSignal = signal('');
    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: contentSignal
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const aiMessage = debugElement.query(By.css('si-ai-message'));
    expect(aiMessage).toBeTruthy();
  });

  it('should apply color variant to underlying container', () => {
    fixture.componentRef.setInput('colorVariant', 'base-1');
    fixture.detectChanges();

    const chatContainer = debugElement.query(By.css('si-chat-container'));
    expect(chatContainer.componentInstance.colorVariant()).toBe('base-1');
  });

  it('should pass noAutoScroll to underlying container', () => {
    fixture.componentRef.setInput('noAutoScroll', true);
    fixture.detectChanges();

    const chatContainer = debugElement.query(By.css('si-chat-container'));
    expect(chatContainer.componentInstance.noAutoScroll()).toBe(true);
  });

  it('should handle user messages with actions', () => {
    const actions: MessageAction[] = [
      {
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    const messages: ChatMessage[] = [
      {
        type: 'user',
        content: 'User message',
        actions
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessage = debugElement.query(By.css('si-user-message'));
    expect(userMessage.componentInstance.actions()).toEqual(actions);
  });

  it('should handle messages with more than 3 actions', () => {
    const actions: MessageAction[] = [
      { label: 'Action 1', icon: 'element-icon1', action: () => {} },
      { label: 'Action 2', icon: 'element-icon2', action: () => {} },
      { label: 'Action 3', icon: 'element-icon3', action: () => {} },
      { label: 'Action 4', icon: 'element-icon4', action: () => {} },
      { label: 'Action 5', icon: 'element-icon5', action: () => {} }
    ];

    const messages: ChatMessage[] = [
      {
        type: 'ai',
        content: 'AI response',
        actions
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const primaryActions = (component as any).getMessagePrimaryActions(messages[0]);
    const secondaryActions = (component as any).getMessageSecondaryActions(messages[0]);

    expect(primaryActions.length).toBe(3);
    expect(secondaryActions.length).toBe(2);
  });

  it('should cache message actions', () => {
    const actions: MessageAction[] = [{ label: 'Action', icon: 'element-icon', action: () => {} }];

    const message: ChatMessage = {
      type: 'ai',
      content: 'Content',
      actions
    };

    const result1 = (component as any).getMessageActions(message);
    const result2 = (component as any).getMessageActions(message);

    expect(result1).toBe(result2);
  });
});
