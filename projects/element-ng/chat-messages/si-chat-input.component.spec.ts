/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  DebugElement,
  inputBinding,
  outputBinding,
  signal,
  twoWayBinding,
  WritableSignal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FileUploadError, UploadFile } from '@siemens/element-ng/file-uploader';
import { MenuItem } from '@siemens/element-ng/menu';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import {
  ChatInputAttachment,
  SiChatInputComponent as TestComponent
} from './si-chat-input.component';

describe('SiChatInputComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;
  let value: WritableSignal<string>;
  let attachments: WritableSignal<ChatInputAttachment[]>;
  let placeholder: WritableSignal<TranslatableString>;
  let disabled: WritableSignal<boolean>;
  let sending: WritableSignal<boolean>;
  let interruptible: WritableSignal<boolean>;
  let maxLength: WritableSignal<number | undefined>;
  let disclaimer: WritableSignal<TranslatableString | undefined>;
  let actions: WritableSignal<MessageAction[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let allowAttachments: WritableSignal<boolean>;
  let maxFileSize: WritableSignal<number>;
  let sendButtonLabel: WritableSignal<TranslatableString>;
  let sendButtonIcon: WritableSignal<string>;
  let sendSpy = vi.fn();
  let interruptSpy = vi.fn();
  let fileErrorSpy = vi.fn();

  beforeEach(() => {
    value = signal('');
    attachments = signal<ChatInputAttachment[]>([]);
    placeholder = signal<TranslatableString>('Enter a message…');
    disabled = signal(false);
    sending = signal(false);
    interruptible = signal(false);
    maxLength = signal<number | undefined>(undefined);
    disclaimer = signal<TranslatableString | undefined>(undefined);
    actions = signal<MessageAction[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    allowAttachments = signal(false);
    maxFileSize = signal(10485760);
    sendButtonLabel = signal<TranslatableString>('Send');
    sendButtonIcon = signal('elementSendFilled');
    sendSpy = vi.fn();
    interruptSpy = vi.fn();
    fileErrorSpy = vi.fn();

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        twoWayBinding('value', value),
        twoWayBinding('attachments', attachments),
        inputBinding('placeholder', placeholder),
        inputBinding('disabled', disabled),
        inputBinding('sending', sending),
        inputBinding('interruptible', interruptible),
        inputBinding('maxLength', maxLength),
        inputBinding('disclaimer', disclaimer),
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('allowAttachments', allowAttachments),
        inputBinding('maxFileSize', maxFileSize),
        inputBinding('sendButtonLabel', sendButtonLabel),
        inputBinding('sendButtonIcon', sendButtonIcon),
        outputBinding('send', sendSpy),
        outputBinding('interrupt', interruptSpy),
        outputBinding('fileError', fileErrorSpy)
      ]
    });
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty value', async () => {
    await fixture.whenStable();
    expect(value()).toBe('');
  });

  it('should have default disabled state of false', async () => {
    await fixture.whenStable();
    expect(disabled()).toBe(false);
  });

  it('should have default sending state of false', async () => {
    await fixture.whenStable();
    expect(sending()).toBe(false);
  });

  it('should have default empty actions array', async () => {
    await fixture.whenStable();
    expect(actions()).toEqual([]);
  });

  it('should have default empty secondary actions array', async () => {
    await fixture.whenStable();
    expect(secondaryActions()).toEqual([]);
  });

  it('should have default empty attachments array', async () => {
    await fixture.whenStable();
    expect(attachments()).toEqual([]);
  });

  it('should have default allowAttachments of false', async () => {
    await fixture.whenStable();
    expect(allowAttachments()).toBe(false);
  });

  it('should have default interruptible state of false', async () => {
    await fixture.whenStable();
    expect(interruptible()).toBe(false);
  });

  it('should have default maxFileSize of 10MB', async () => {
    await fixture.whenStable();
    expect(maxFileSize()).toBe(10485760);
  });

  it('should render textarea input', async () => {
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea).toBeTruthy();
  });

  it('should render send button', async () => {
    await fixture.whenStable();

    const sendButton = debugElement.query(By.css('button'));
    expect(sendButton).toBeTruthy();
  });

  it('should disable send button when no content and no attachments', async () => {
    value.set('');
    attachments.set([]);
    await fixture.whenStable();

    expect((component as any).canSend()).toBe(false);
  });

  it('should enable send button when there is content', async () => {
    value.set('Hello');
    await fixture.whenStable();

    expect((component as any).canSend()).toBe(true);
  });

  it('should enable send button when there are attachments', async () => {
    attachments.set([
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ]);
    await fixture.whenStable();

    expect((component as any).canSend()).toBe(true);
  });

  it('should disable send button when disabled is true', async () => {
    value.set('Hello');
    disabled.set(true);
    await fixture.whenStable();

    expect((component as any).canSend()).toBe(false);
  });

  it('should disable send button when sending is true', async () => {
    value.set('Hello');
    sending.set(true);
    await fixture.whenStable();

    expect((component as any).canSend()).toBe(false);
  });

  it('should emit send event when send button is clicked', async () => {
    value.set('Test message');
    await fixture.whenStable();

    const sendButton = debugElement.query(By.css('button'));
    sendButton.nativeElement.click();

    expect(sendSpy).toHaveBeenCalledWith({
      content: 'Test message',
      attachments: []
    });
  });

  it('should clear input after sending', async () => {
    value.set('Test message');
    await fixture.whenStable();

    (component as any).onSend();

    expect(value()).toBe('');
  });

  it('should clear attachments after sending', async () => {
    attachments.set([
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ]);
    await fixture.whenStable();

    (component as any).onSend();

    expect(attachments()).toEqual([]);
  });

  it('should send on Enter key press', async () => {
    value.set('Test message');
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    textarea.nativeElement.dispatchEvent(event);

    expect(sendSpy).toHaveBeenCalled();
  });

  it('should not send on Shift+Enter key press', async () => {
    value.set('Test message');
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    vi.spyOn(event, 'preventDefault');
    textarea.nativeElement.dispatchEvent(event);

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('should interrupt and send on Enter when interruptible is true', async () => {
    value.set('Test message');
    interruptible.set(true);
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    vi.spyOn(event, 'preventDefault');
    textarea.nativeElement.dispatchEvent(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(interruptSpy).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not render attachment list when no attachments', async () => {
    attachments.set([]);
    await fixture.whenStable();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeFalsy();
  });

  it('should render attachment list when attachments exist', async () => {
    attachments.set([
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ]);
    await fixture.whenStable();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeTruthy();
  });

  it('should remove attachment when remove is triggered', async () => {
    const testAttachments: ChatInputAttachment[] = [
      {
        name: 'file1.txt',
        file: new File(['content1'], 'file1.txt'),
        size: 100,
        type: 'text/plain'
      },
      {
        name: 'file2.txt',
        file: new File(['content2'], 'file2.txt'),
        size: 200,
        type: 'text/plain'
      }
    ];
    attachments.set(testAttachments);
    await fixture.whenStable();

    (component as any).removeAttachment(testAttachments[0]);

    expect(attachments().length).toBe(1);
    expect(attachments()[0].name).toBe('file2.txt');
  });

  it('should add files on file upload', () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const uploadFiles: UploadFile[] = [
      {
        fileName: 'test.txt',
        file: mockFile,
        status: 'added'
      } as UploadFile
    ];

    (component as any).onFilesAdded(uploadFiles);

    expect(attachments().length).toBe(1);
    expect(attachments()[0].name).toBe('test.txt');
    expect(attachments()[0].file).toBe(mockFile);
  });

  it('should filter out non-added files', () => {
    const uploadFiles: UploadFile[] = [
      {
        fileName: 'test1.txt',
        file: new File(['content1'], 'test1.txt'),
        status: 'added'
      } as UploadFile,
      {
        fileName: 'test2.txt',
        file: new File(['content2'], 'test2.txt'),
        status: 'error'
      } as UploadFile
    ];

    (component as any).onFilesAdded(uploadFiles);

    expect(attachments().length).toBe(1);
    expect(attachments()[0].name).toBe('test1.txt');
  });

  it('should emit file error event', () => {
    const mockError = {
      fileName: 'large.txt'
    } as FileUploadError;

    (component as any).onFileError(mockError);

    expect(fileErrorSpy).toHaveBeenCalledWith(mockError);
  });

  it('should use custom placeholder', async () => {
    placeholder.set('Type your message here...');
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.placeholder).toBe('Type your message here...');
  });

  it('should use custom send button label', async () => {
    sendButtonLabel.set('Submit');
    await fixture.whenStable();

    const sendButton = debugElement.query(By.css('button'));
    expect(sendButton.nativeElement).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Submit')
    );
  });

  it('should use custom send button icon', async () => {
    sendButtonIcon.set('element-check');
    await fixture.whenStable();

    const icon = debugElement.query(By.css('button si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-check');
  });

  it('should show stop icon when interruptible is true', async () => {
    interruptible.set(true);
    await fixture.whenStable();

    expect(
      debugElement.query(By.css('button[aria-label="Interrupt"] [data-icon="elementStopFilled"]'))
    ).toBeTruthy();
  });

  it('should use interrupt button label when interruptible is true', async () => {
    interruptible.set(true);
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Interrupt')
    );
  });

  it('should emit interrupt event when interrupt button is clicked', async () => {
    interruptible.set(true);
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(interruptSpy).toHaveBeenCalled();
  });

  it('should disable interrupt button when sending is true', async () => {
    interruptible.set(true);
    sending.set(true);
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement).toBeDisabled();
  });

  it('should disable interrupt button when disabled is true', async () => {
    interruptible.set(true);
    disabled.set(true);
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement).toBeDisabled();
  });

  it('should not clear input and attachments when interrupt is triggered', async () => {
    const testAttachments: ChatInputAttachment[] = [
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];

    value.set('Test message');
    attachments.set(testAttachments);
    interruptible.set(true);
    await fixture.whenStable();

    (component as any).onButtonClick();

    expect(value()).toBe('Test message');
    expect(attachments()).toEqual(testAttachments);
  });

  it('should respect maxLength', async () => {
    maxLength.set(10);
    await fixture.whenStable();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.maxLength).toBe(10);
  });

  it('should show disclaimer when provided', async () => {
    disclaimer.set('This is a disclaimer');
    await fixture.whenStable();

    const disclaimerElement = debugElement.query(By.css('.si-caption'));
    expect(disclaimerElement).toBeTruthy();
    expect(disclaimerElement.nativeElement).toHaveTextContent('This is a disclaimer');
  });

  it('should render action buttons when actions are provided', async () => {
    actions.set([
      {
        label: 'Attach',
        icon: 'element-attachment',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Attach');
  });

  it('should have focus method', async () => {
    await fixture.whenStable();
    expect(typeof component.focus).toBe('function');
  });

  it('should use send mode when interruptible is false', async () => {
    value.set('Test message');
    interruptible.set(false);
    await fixture.whenStable();

    expect((component as any).showInterruptButton()).toBe(false);
    const sendButton = debugElement.query(By.css('button[aria-label="Send"]'));
    expect(sendButton).toBeTruthy();
    expect(sendButton.query(By.css('[data-icon="elementSendFilled"]'))).toBeTruthy();
  });

  it('should use interrupt mode when interruptible is true', async () => {
    interruptible.set(true);
    await fixture.whenStable();

    expect((component as any).showInterruptButton()).toBe(true);
    const interruptButton = debugElement.query(By.css('button[aria-label="Interrupt"]'));
    expect(interruptButton).toBeTruthy();
    expect(interruptButton.query(By.css('[data-icon="elementStopFilled"]'))).toBeTruthy();
  });
});
