/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuItem } from '@siemens/element-ng/menu';

import { MARKDOWN_RENDERER } from './markdown-renderer';
import { MessageAction } from './message-action.model';
import { Attachment } from './si-attachment-list.component';
import { SiChatMessageComponent as TestComponent } from './si-chat-message.component';

describe('SiChatMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let content: WritableSignal<string>;
  let markdown: WritableSignal<boolean>;
  let flow: WritableSignal<'incoming' | 'outgoing'>;
  let alignment: WritableSignal<'start' | 'center' | 'end' | undefined>;
  let messageVariant: WritableSignal<string>;
  let actionPlacement: WritableSignal<'side' | 'bottom'>;
  let actions: WritableSignal<MessageAction[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let attachments: WritableSignal<Attachment[]>;
  let loading: WritableSignal<boolean>;
  let streaming: WritableSignal<boolean>;
  let editable: WritableSignal<boolean>;
  let editing: WritableSignal<boolean>;
  let edited: WritableSignal<boolean>;

  beforeEach(() => {
    content = signal('Hello message');
    markdown = signal(false);
    flow = signal<'incoming' | 'outgoing'>('incoming');
    alignment = signal<'start' | 'center' | 'end' | undefined>(undefined);
    messageVariant = signal('');
    actionPlacement = signal<'side' | 'bottom'>('side');
    actions = signal<MessageAction[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    attachments = signal<Attachment[]>([]);
    loading = signal(false);
    streaming = signal(false);
    editable = signal(false);
    editing = signal(false);
    edited = signal(false);

    fixture = TestBed.configureTestingModule({
      providers: [
        {
          provide: MARKDOWN_RENDERER,
          useValue: (text: string) => {
            const div = document.createElement('div');
            div.className = 'markdown-content';
            div.textContent = `rendered:${text}`;
            return div;
          }
        }
      ]
    }).createComponent(TestComponent, {
      bindings: [
        twoWayBinding('content', content),
        inputBinding('markdown', markdown),
        inputBinding('flow', flow),
        inputBinding('alignment', alignment),
        inputBinding('messageVariant', messageVariant),
        inputBinding('actionPlacement', actionPlacement),
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('attachments', attachments),
        inputBinding('loading', loading),
        inputBinding('streaming', streaming),
        inputBinding('editable', editable),
        inputBinding('editing', editing),
        inputBinding('edited', edited)
      ]
    });

    debugElement = fixture.debugElement;
  });

  it('should derive end alignment from outgoing flow', async () => {
    flow.set('outgoing');
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveAttribute('alignment', 'end');
  });

  it('should allow explicit alignment override', async () => {
    flow.set('outgoing');
    alignment.set('center');
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveAttribute('alignment', 'center');
  });

  it('should set flow and message variant attributes on host', async () => {
    flow.set('incoming');
    messageVariant.set('ai');
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveAttribute('flow', 'incoming');
    expect(fixture.nativeElement).toHaveAttribute('message-variant', 'ai');
  });

  it('should show loading skeleton when loading is true', async () => {
    loading.set(true);
    await fixture.whenStable();

    const skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeTruthy();
  });

  it('should render plain string content when markdown is false', async () => {
    content.set('Plain content');
    markdown.set(false);
    await fixture.whenStable();

    const messageBubble = debugElement.query(By.css('.message-bubble'));
    expect(messageBubble.nativeElement.textContent).toContain('Plain content');
  });

  it('should render markdown content when markdown is true', async () => {
    content.set('**Bold**');
    markdown.set(true);
    await fixture.whenStable();

    const markdownContent = fixture.nativeElement.querySelector('.markdown-content') as HTMLElement;
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.textContent).toContain('rendered:**Bold**');
  });

  it('should render attachment list when attachments are provided', async () => {
    attachments.set([{ name: 'file.txt' }]);
    await fixture.whenStable();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeTruthy();
  });

  it('should render primary actions', async () => {
    actions.set([
      {
        label: 'Copy',
        icon: 'element-copy',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('.actions-wrapper button');
    expect(actionButtons).toHaveLength(1);
  });

  it('should render secondary actions trigger', async () => {
    secondaryActions.set([
      {
        type: 'action',
        label: 'Bookmark',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const menuTrigger = fixture.nativeElement.querySelector('button.cdk-menu-trigger');
    expect(menuTrigger).toBeTruthy();
  });

  it('should show cursor when streaming is true', async () => {
    streaming.set(true);
    await fixture.whenStable();

    const cursor = debugElement.query(By.css('.streaming-cursor'));
    expect(cursor).toBeTruthy();
  });

  it('should show edited indicator when edited is true', async () => {
    edited.set(true);
    await fixture.whenStable();

    const indicator = debugElement.query(By.css('.edited-indicator'));
    expect(indicator.nativeElement.textContent).toContain('Edited');
  });

  it('should render edit textarea when editing is active', async () => {
    editable.set(true);
    editing.set(true);
    content.set('Editable text');
    await fixture.whenStable();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Editable text');
  });

  it('should set aria-label for edit textarea', async () => {
    editable.set(true);
    editing.set(true);
    content.set('Editable text');
    await fixture.whenStable();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.getAttribute('aria-label')).toBe('Edit message');
  });

  it('should update content when saving edit', async () => {
    editable.set(true);
    editing.set(true);
    content.set('Editable text');
    await fixture.whenStable();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Updated text';
    textarea.dispatchEvent(new Event('input'));

    const saveButton = fixture.nativeElement.querySelector(
      '.edit-actions .btn-primary'
    ) as HTMLButtonElement;
    saveButton.click();
    await fixture.whenStable();

    expect(content()).toBe('Updated text');
  });
});
