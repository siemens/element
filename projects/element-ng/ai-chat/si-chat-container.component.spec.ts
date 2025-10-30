/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageAction, ChatInputAttachment } from '@siemens/element-ng/chat-messages';

import {
  ChatMessage,
  SiChatContainerComponent as TestComponent
} from './si-chat-container.component';

describe('SiChatContainerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default disabled state of false', () => {
    fixture.detectChanges();
    expect(component.disabled()).toBe(false);
  });

  it('should have default sending state of false', () => {
    fixture.detectChanges();
    expect(component.sending()).toBe(false);
  });

  it('should have default loading state of false', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should have default disableInterrupt state of false', () => {
    fixture.detectChanges();
    expect(component.disableInterrupt()).toBe(false);
  });

  it('should have default interrupting state of false', () => {
    fixture.detectChanges();
    expect(component.interrupting()).toBe(false);
  });

  it('should have default allowAttachments of false', () => {
    fixture.detectChanges();
    expect(component.allowAttachments()).toBe(false);
  });

  it('should have default noAutoScroll of false', () => {
    fixture.detectChanges();
    expect(component.noAutoScroll()).toBe(false);
  });

  it('should have default empty messages array', () => {
    fixture.detectChanges();
    expect(component.messages()).toBeUndefined();
  });

  it('should have default empty attachments array', () => {
    fixture.detectChanges();
    expect(component.attachments()).toEqual([]);
  });

  it('should have default empty inputValue', () => {
    fixture.detectChanges();
    expect(component.inputValue()).toBe('');
  });

  it('should have default colorVariant of base-0', () => {
    fixture.detectChanges();
    expect(component.colorVariant()).toBe('base-0');
  });

  it('should have default aiIcon of element-ai', () => {
    fixture.detectChanges();
    expect(component.aiIcon()).toBe('element-ai');
  });

  it('should render empty state when no messages', () => {
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('emptyStateTitle', 'No messages');
    fixture.componentRef.setInput('emptyStateDescription', 'Start a conversation');
    fixture.detectChanges();

    const emptyState = debugElement.query(By.css('si-empty-state'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.componentInstance.heading()).toBe('No messages');
    expect(emptyState.componentInstance.content()).toBe('Start a conversation');
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

    const emptyState = debugElement.query(By.css('si-empty-state'));
    expect(emptyState).toBeFalsy();
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

  it('should render tool messages', () => {
    const messages: ChatMessage[] = [
      {
        type: 'tool',
        name: 'Calculator',
        content: '',
        output: '42'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const toolMessage = debugElement.query(By.css('si-tool-message'));
    expect(toolMessage).toBeTruthy();
  });

  it('should render chat input', () => {
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput).toBeTruthy();
  });

  it('should pass disabled state to chat input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.disabled()).toBe(true);
  });

  it('should pass effective sending state to chat input', () => {
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.sending()).toBe(true);
  });

  it('should pass sending state when interrupting is true', () => {
    fixture.componentRef.setInput('interrupting', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.sending()).toBe(true);
  });

  it('should pass interruptible state to chat input when loading and not disabled', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', false);
    fixture.componentRef.setInput('sending', false);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.interruptible()).toBe(true);
  });

  it('should not pass interruptible when disableInterrupt is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', true);
    fixture.componentRef.setInput('sending', false);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.interruptible()).toBe(false);
  });

  it('should not pass interruptible when sending is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', false);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.interruptible()).toBe(false);
  });

  it('should pass interruptible when interrupting is true regardless of other states', () => {
    fixture.componentRef.setInput('interrupting', true);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('disableInterrupt', true);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.interruptible()).toBe(true);
  });

  it('should pass allowAttachments to chat input', () => {
    fixture.componentRef.setInput('allowAttachments', true);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.allowAttachments()).toBe(true);
  });

  it('should pass accept to chat input', () => {
    const acceptTypes = '.pdf,.txt';
    fixture.componentRef.setInput('accept', acceptTypes);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.accept()).toBe(acceptTypes);
  });

  it('should pass maxFileSize to chat input', () => {
    const maxSize = 5242880; // 5MB
    fixture.componentRef.setInput('maxFileSize', maxSize);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.maxFileSize()).toBe(maxSize);
  });

  it('should pass disclaimer to chat input', () => {
    const customDisclaimer = 'Custom disclaimer';
    fixture.componentRef.setInput('disclaimer', customDisclaimer);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.disclaimer()).toBe(customDisclaimer);
  });

  it('should pass inputActions to chat input', () => {
    const actions: MessageAction[] = [
      {
        label: 'Attach',
        icon: 'element-attachment',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('inputActions', actions);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.actions()).toEqual(actions);
  });

  it('should pass inputPlaceholder to chat input', () => {
    const customPlaceholder = 'Type something...';
    fixture.componentRef.setInput('inputPlaceholder', customPlaceholder);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.placeholder()).toBe(customPlaceholder);
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
        attachments: [
          { id: 'a1', name: 'file1.txt' },
          { id: 'a2', name: 'file2.pdf' }
        ]
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessage = debugElement.query(By.css('si-user-message'));
    expect(userMessage.componentInstance.attachments().length).toBe(2);
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

  it('should use custom empty state title', () => {
    const customTitle = 'No messages yet';
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('emptyStateTitle', customTitle);
    fixture.detectChanges();

    const emptyState = debugElement.query(By.css('si-empty-state'));
    expect(emptyState.componentInstance.heading()).toBe(customTitle);
  });

  it('should use custom empty state description', () => {
    const customDescription = 'Start by sending a message';
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('emptyStateDescription', customDescription);
    fixture.detectChanges();

    const emptyState = debugElement.query(By.css('si-empty-state'));
    expect(emptyState.componentInstance.content()).toBe(customDescription);
  });

  it('should use custom AI icon in empty state', () => {
    const customIcon = 'element-robot';
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('aiIcon', customIcon);
    fixture.detectChanges();

    const emptyState = debugElement.query(By.css('si-empty-state'));
    expect(emptyState.componentInstance.icon()).toBe(customIcon);
  });

  it('should apply color variant class', () => {
    fixture.componentRef.setInput('colorVariant', 'base-1');
    fixture.detectChanges();

    expect(debugElement.nativeElement.classList.contains('base-1')).toBe(true);
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
      },
      {
        type: 'tool',
        name: 'Tool',
        content: '',
        output: 'Result'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const userMessages = debugElement.queryAll(By.css('si-user-message'));
    const aiMessages = debugElement.queryAll(By.css('si-ai-message'));
    const toolMessages = debugElement.queryAll(By.css('si-tool-message'));

    expect(userMessages.length).toBe(1);
    expect(aiMessages.length).toBe(1);
    expect(toolMessages.length).toBe(1);
  });

  it('should bind inputValue model', () => {
    const initialValue = 'Initial text';
    component.inputValue.set(initialValue);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.value()).toBe(initialValue);
  });

  it('should bind attachments model', () => {
    const attachments: ChatInputAttachment[] = [
      {
        id: '1',
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];

    component.attachments.set(attachments);
    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    expect(chatInput.componentInstance.attachments()).toEqual(attachments);
  });

  it('should emit interrupt event when chat input interrupts', () => {
    let interruptEmitted = false;
    component.interrupt.subscribe(() => {
      interruptEmitted = true;
    });

    fixture.detectChanges();

    const chatInput = debugElement.query(By.css('si-chat-input'));
    chatInput.componentInstance.interrupt.emit();

    expect(interruptEmitted).toBe(true);
  });

  it('should compute inputInterruptible correctly', () => {
    // Test loading=true, disableInterrupt=false, sending=false -> should be true
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('disableInterrupt', false);
    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(true);

    // Test interrupting=true -> should be true regardless of other states
    fixture.componentRef.setInput('interrupting', true);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('disableInterrupt', true);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(true);

    // Test loading=false, interrupting=false -> should be false
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputInterruptible()).toBe(false);
  });

  it('should compute inputSending correctly', () => {
    // Test sending=true -> should be true
    fixture.componentRef.setInput('sending', true);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);

    // Test interrupting=true -> should be true
    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', true);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);

    // Test both true -> should be true
    fixture.componentRef.setInput('sending', true);
    fixture.componentRef.setInput('interrupting', true);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(true);

    // Test both false -> should be false
    fixture.componentRef.setInput('sending', false);
    fixture.componentRef.setInput('interrupting', false);
    fixture.detectChanges();

    expect((component as any).inputSending()).toBe(false);
  });
});
