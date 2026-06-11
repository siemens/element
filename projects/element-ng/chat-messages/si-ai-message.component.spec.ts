/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';

import { MessageAction } from './message-action.model';
import { SiAiMessageComponent as TestComponent } from './si-ai-message.component';
import { SiChatAnnotatedText } from './si-annotated-text.model';
import { SiCitationButtonComponent } from './si-citation-button.component';
import { SiCitationPillComponent } from './si-citation-pill.component';

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
  let annotatedText: WritableSignal<SiChatAnnotatedText | undefined>;
  let showSourceCitationButton: WritableSignal<boolean>;

  beforeEach(() => {
    content = signal('');
    contentFormatter = signal<((text: string) => string | Node) | undefined>(undefined);
    loading = signal(false);
    actions = signal<MessageAction[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    actionParam = signal<unknown>(undefined);
    annotatedText = signal<SiChatAnnotatedText | undefined>(undefined);
    showSourceCitationButton = signal(false);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('content', content),
        inputBinding('contentFormatter', contentFormatter),
        inputBinding('loading', loading),
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('actionParam', actionParam),
        inputBinding('annotatedText', annotatedText),
        inputBinding('showSourceCitationButton', showSourceCitationButton)
      ]
    });
    debugElement = fixture.debugElement;
    const sanitizer = TestBed.inject(DomSanitizer);
    markdownRenderer = getMarkdownRenderer(sanitizer);
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
    expect(actionButtons).toHaveLength(1);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Copy');
  });

  it('should not render action buttons when no actions and no secondary actions', async () => {
    actions.set([]);
    secondaryActions.set([]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons).toHaveLength(0);
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
    expect(actionButtons).toHaveLength(2);
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
    expect(actionButtons).toHaveLength(0);
  });

  describe('showSourceCitationButton', () => {
    const ANNOTATED: SiChatAnnotatedText = {
      segments: [
        { type: 'text', content: 'Hello ' },
        { type: 'citation', citationId: 'src1' },
        { type: 'text', content: ' world' }
      ],
      citations: [{ id: 'src1', title: 'Source One', url: 'https://example.com/1' }]
    };

    it('should not render inline citation pills when showSourceCitationButton is true', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(true);
      await fixture.whenStable();

      const pills = debugElement.queryAll(By.directive(SiCitationPillComponent));
      expect(pills).toHaveLength(0);
    });

    it('should render inline citation pills when showSourceCitationButton is false (default)', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(false);
      await fixture.whenStable();

      const pills = debugElement.queryAll(By.directive(SiCitationPillComponent));
      expect(pills).toHaveLength(1);
    });

    it('should render the citation button in the action bar when showSourceCitationButton is true and citations exist', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(true);
      await fixture.whenStable();

      const citationButton = debugElement.query(By.directive(SiCitationButtonComponent));
      expect(citationButton).toBeTruthy();
    });

    it('should not render the citation button when showSourceCitationButton is false', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(false);
      await fixture.whenStable();

      const citationButton = debugElement.query(By.directive(SiCitationButtonComponent));
      expect(citationButton).toBeFalsy();
    });

    it('should not render the citation button when there are no citations', async () => {
      annotatedText.set({ segments: [{ type: 'text', content: 'Hello' }], citations: [] });
      showSourceCitationButton.set(true);
      await fixture.whenStable();

      const citationButton = debugElement.query(By.directive(SiCitationButtonComponent));
      expect(citationButton).toBeFalsy();
    });

    it('should show the action bar via citation button even when actions array is empty', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(true);
      actions.set([]);
      secondaryActions.set([]);
      await fixture.whenStable();

      const actionBar = fixture.nativeElement.querySelector('[siChatMessageAction]');
      expect(actionBar).toBeTruthy();
    });

    it('should pass all citations to the citation button', async () => {
      const multiCitation: SiChatAnnotatedText = {
        segments: [
          { type: 'citation', citationId: 'a' },
          { type: 'citation', citationId: 'b' }
        ],
        citations: [
          { id: 'a', title: 'Citation A' },
          { id: 'b', title: 'Citation B' }
        ]
      };
      annotatedText.set(multiCitation);
      showSourceCitationButton.set(true);
      await fixture.whenStable();

      const citationButton = debugElement.query(By.directive(SiCitationButtonComponent));
      expect(citationButton.componentInstance.citations()).toHaveLength(2);
    });

    it('should emit citationClicked when the citation button emits citationClicked', async () => {
      annotatedText.set(ANNOTATED);
      showSourceCitationButton.set(true);
      await fixture.whenStable();

      const emitted: unknown[] = [];
      fixture.componentInstance.citationClicked.subscribe(c => emitted.push(c));

      const citationButton = debugElement.query(By.directive(SiCitationButtonComponent));
      citationButton.componentInstance.citationClicked.emit(ANNOTATED.citations[0]);
      await fixture.whenStable();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBe(ANNOTATED.citations[0]);
    });
  });
});
