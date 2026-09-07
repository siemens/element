/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
      providers: [provideZonelessChangeDetection()]
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

  it('should automatically expand activities and show the latest detail by default', () => {
    expect(component.autoExpand()).toBe(true);
    expect(component.show()).toBe('auto');
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
    const markdown = debugElement.query(By.css('si-user-message si-markdown'));
    expect(userMessage).toBeTruthy();
    expect(markdown.componentInstance.markdown()).toBe('Hello');
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
    const markdown = debugElement.query(By.css('si-ai-message si-markdown'));
    expect(aiMessage).toBeTruthy();
    expect(markdown.componentInstance.markdown()).toBe('Hello there!');
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
    expect(userMessage.componentInstance.attachments()).toHaveLength(2);
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

    const markdown = debugElement.query(By.css('si-ai-message si-markdown'));
    expect(markdown.componentInstance.markdown()).toBe('Streaming content...');
  });

  it('should expand only the latest detail of the latest activity', () => {
    const messages: ChatMessage[] = [
      {
        type: 'activity',
        name: 'Searching',
        input: { query: 'motors' },
        output: 'Found **three** results'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.componentRef.setInput('show', 'both');
    fixture.detectChanges();

    const activity = debugElement.query(By.css('si-activity-message'));
    const parts = debugElement.queryAll(By.css('si-activity-message-part'));
    const markdown = debugElement.queryAll(By.css('si-activity-message-part si-markdown'));
    expect(activity.componentInstance.heading()).toBe('Searching');
    expect(parts).toHaveLength(2);
    expect(parts[0].componentInstance.expanded()).toBe(false);
    expect(parts[1].componentInstance.expanded()).toBe(true);
    expect(markdown).toHaveLength(1);
    expect(markdown[0].componentInstance.markdown()).toBe('Found **three** results');
  });

  it('should show output instead of inputs in auto mode', () => {
    fixture.componentRef.setInput('messages', [
      {
        type: 'activity',
        name: 'Searching',
        input: ['motors', 'drives'],
        output: 'Found results'
      }
    ] satisfies ChatMessage[]);
    fixture.detectChanges();

    const parts = debugElement.queryAll(By.css('si-activity-message-part'));
    expect(parts).toHaveLength(1);
    expect(parts[0].componentInstance.heading()).toBe('Output');
  });

  it('should allow activity expansion to override the global setting', () => {
    fixture.componentRef.setInput('autoExpand', false);
    fixture.componentRef.setInput('messages', [
      { type: 'activity', name: 'Reasoning', content: 'Details', autoExpand: true }
    ] satisfies ChatMessage[]);
    fixture.detectChanges();

    const activity = debugElement.query(By.css('si-activity-message'));
    expect(activity.componentInstance.expanded()).toBe(true);
  });

  it('should allow individual record inputs to opt into expansion', () => {
    fixture.componentRef.setInput('autoExpand', false);
    fixture.componentRef.setInput('show', 'inputs');
    fixture.componentRef.setInput('messages', [
      {
        type: 'activity',
        name: 'Searching',
        input: { query: 'motors', source: 'manuals' },
        autoExpandInputs: ['source']
      }
    ] satisfies ChatMessage[]);
    fixture.detectChanges();

    const parts = debugElement.queryAll(By.css('si-activity-message-part'));
    expect(parts).toHaveLength(2);
    expect(parts[0].componentInstance.expanded()).toBe(false);
    expect(parts[1].componentInstance.expanded()).toBe(true);
  });

  it('should allow output expansion to opt out of the global setting', () => {
    fixture.componentRef.setInput('messages', [
      {
        type: 'activity',
        name: 'Searching',
        output: 'Found results',
        autoExpandOutputs: false
      }
    ] satisfies ChatMessage[]);
    fixture.detectChanges();

    const activity = debugElement.query(By.css('si-activity-message'));
    const part = debugElement.query(By.css('si-activity-message-part'));
    expect(activity.componentInstance.expanded()).toBe(true);
    expect(part.componentInstance.expanded()).toBe(false);
  });

  it('should render reasoning directly in the activity message', () => {
    const messages: ChatMessage[] = [
      {
        type: 'activity',
        content: 'Checking **performance**'
      }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const activity = debugElement.query(By.css('si-activity-message'));
    const markdown = debugElement.query(By.css('si-activity-message si-markdown'));
    expect(activity.componentInstance.expanded()).toBe(true);
    expect(markdown.componentInstance.markdown()).toBe('Checking **performance**');
  });

  it('should collapse details after a newer activity', () => {
    const messages: ChatMessage[] = [
      { type: 'activity', name: 'First', output: 'First output' },
      { type: 'ai', content: 'Intermediate response' },
      { type: 'activity', name: 'Second', output: 'Second output' }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const activities = debugElement.queryAll(By.css('si-activity-message'));
    const parts = debugElement.queryAll(By.css('si-activity-message-part'));
    expect(activities[0].componentInstance.expanded()).toBe(false);
    expect(activities[1].componentInstance.expanded()).toBe(true);
    expect(parts).toHaveLength(1);
    expect(parts[0].componentInstance.expanded()).toBe(true);
  });

  it('should collapse activity details when followed by a user message', () => {
    const messages: ChatMessage[] = [
      { type: 'activity', name: 'Search', output: 'Found a result' },
      { type: 'ai', content: 'Result' },
      { type: 'user', content: 'Follow-up question' }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const activity = debugElement.query(By.css('si-activity-message'));
    expect(activity.componentInstance.expanded()).toBe(false);
    expect(debugElement.query(By.css('si-activity-message-part'))).toBeNull();
  });

  it('should render and automatically expand the latest activity trace', () => {
    const messages: ChatMessage[] = [
      {
        type: 'activity-trace',
        name: 'Analysis',
        messages: [
          { type: 'activity', name: 'Search', content: 'Search details' },
          { type: 'activity', name: 'Reasoning', content: 'Relevant details' }
        ]
      },
      { type: 'ai', content: 'Result' }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const trace = debugElement.query(By.css('si-activity-trace'));
    const activities = debugElement.queryAll(By.css('si-activity-message'));
    expect(trace.componentInstance.expanded()).toBe(true);
    expect(activities).toHaveLength(2);
    expect(activities[0].componentInstance.expanded()).toBe(false);
    expect(activities[1].componentInstance.expanded()).toBe(true);
  });

  it('should collapse an activity trace when followed by a user message', () => {
    const messages: ChatMessage[] = [
      {
        type: 'activity-trace',
        name: 'Analysis',
        messages: [{ type: 'activity', name: 'Search', content: 'Search details' }]
      },
      { type: 'ai', content: 'Result' },
      { type: 'user', content: 'Follow-up question' }
    ];

    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const trace = debugElement.query(By.css('si-activity-trace'));
    expect(trace.componentInstance.expanded()).toBe(false);
    expect(debugElement.query(By.css('si-activity-message'))).toBeNull();
  });

  it('should allow a nested activity to opt into expansion', () => {
    fixture.componentRef.setInput('autoExpand', false);
    fixture.componentRef.setInput('messages', [
      {
        type: 'activity-trace',
        name: 'Analysis',
        messages: [
          {
            type: 'activity',
            name: 'Workflow',
            content: 'Workflow details',
            messages: [
              {
                type: 'activity',
                name: 'Read',
                content: 'Read details',
                autoExpand: true
              }
            ]
          }
        ]
      }
    ] satisfies ChatMessage[]);
    fixture.detectChanges();

    const trace = debugElement.query(By.css('si-activity-trace'));
    const activities = debugElement.queryAll(By.css('si-activity-message'));
    expect(trace.componentInstance.expanded()).toBe(true);
    expect(activities).toHaveLength(2);
    expect(activities[0].componentInstance.expanded()).toBe(true);
    expect(activities[1].componentInstance.expanded()).toBe(true);
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

    expect(userMessages).toHaveLength(1);
    expect(aiMessages).toHaveLength(1);
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

    const markdown = debugElement.query(By.css('si-ai-message si-markdown'));
    expect(markdown.componentInstance.markdown()).toBe('Initial content');

    contentSignal.set('Updated content');
    fixture.detectChanges();

    expect(markdown.componentInstance.markdown()).toBe('Updated content');
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

    expect(primaryActions).toHaveLength(3);
    expect(secondaryActions).toHaveLength(2);
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
