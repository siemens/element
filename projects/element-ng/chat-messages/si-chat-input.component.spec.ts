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
  let followUpPrompts: WritableSignal<string[]>;
  let followUpPromptSelectedSpy = vi.fn();
  let voiceInput: WritableSignal<boolean>;
  let voiceState: WritableSignal<'idle' | 'listening' | 'recording'>;
  let startSpy = vi.fn<() => void>();
  let confirmSpy = vi.fn<() => void>();
  let cancelSpy = vi.fn<() => void>();
  let voiceLabels: WritableSignal<{
    start: string;
    cancel: string;
    confirm: string;
    listening: string;
  }>;

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
    followUpPrompts = signal<string[]>([]);
    followUpPromptSelectedSpy = vi.fn();
    voiceInput = signal(false);
    voiceState = signal<'idle' | 'listening' | 'recording'>('idle');
    startSpy = vi.fn<() => void>();
    confirmSpy = vi.fn<() => void>();
    cancelSpy = vi.fn<() => void>();
    voiceLabels = signal({
      start: 'Start dictation',
      cancel: 'Cancel dictation',
      confirm: 'Confirm dictation',
      listening: 'Listening…'
    });

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
        outputBinding('fileError', fileErrorSpy),
        inputBinding('followUpPrompts', followUpPrompts),
        outputBinding('followUpPromptSelected', followUpPromptSelectedSpy),
        inputBinding('voiceInput', voiceInput),
        inputBinding('voiceInputState', voiceState),
        outputBinding('voiceInputStart', startSpy),
        outputBinding('voiceInputConfirm', confirmSpy),
        outputBinding('voiceInputCancel', cancelSpy),
        inputBinding('startDictationLabel', () => voiceLabels().start),
        inputBinding('cancelDictationLabel', () => voiceLabels().cancel),
        inputBinding('confirmDictationLabel', () => voiceLabels().confirm),
        inputBinding('listeningLabel', () => voiceLabels().listening)
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

  it('should resize the textarea when the value is updated externally', async () => {
    await fixture.whenStable();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const initialHeight = parseFloat(textarea.style.height);
    vi.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(80);

    value.set('A transcript\nwith multiple lines\nupdated by the consumer');
    await fixture.whenStable();

    expect(textarea.value).toBe(value());
    expect(parseFloat(textarea.style.height)).toBeGreaterThan(initialHeight);
  });

  it('should render send button', async () => {
    await fixture.whenStable();

    const sendButton = debugElement.query(By.css('button'));
    expect(sendButton).toBeTruthy();
  });

  it('should resize during IME composition before the model updates', async () => {
    await fixture.whenStable();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const initialHeight = parseFloat(textarea.style.height);
    vi.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(180);

    textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    textarea.value = 'Composing\na multiline\nmessage';
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await fixture.whenStable();

    expect(value()).toBe('');
    expect(parseFloat(textarea.style.height)).toBeGreaterThan(initialHeight);

    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await fixture.whenStable();
    expect(value()).toBe(textarea.value);
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

    expect(attachments()).toHaveLength(1);
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

    expect(attachments()).toHaveLength(1);
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

    expect(attachments()).toHaveLength(1);
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
      debugElement.query(
        By.css('button[aria-label="Stop processing"] [data-icon="elementStopFilled"]')
      )
    ).toBeTruthy();
  });

  it('should use interrupt button label when interruptible is true', async () => {
    interruptible.set(true);
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Stop processing')
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

    const disclaimerElement = debugElement.query(By.css('.si-body-sm'));
    expect(disclaimerElement).toBeTruthy();
    expect(disclaimerElement.nativeElement).toHaveTextContent('This is a disclaimer');
  });

  it('should render primary actions inline without an actions menu', async () => {
    actions.set([
      {
        label: 'Attach',
        icon: 'element-attachment',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('button');
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Attach');
    expect(actionButtons[0]).toHaveAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector('button.cdk-menu-trigger')).toBeFalsy();
  });

  it('should render the attachment button inline when there are no secondary actions', async () => {
    allowAttachments.set(true);
    await fixture.whenStable();

    const actionButtons = fixture.nativeElement.querySelectorAll('button');
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toHaveAttribute('aria-label', 'Attach file');
    expect(fixture.nativeElement.querySelector('button.cdk-menu-trigger')).toBeFalsy();
  });

  it('should render the attachment button in the menu when secondary actions exist', async () => {
    allowAttachments.set(true);
    secondaryActions.set([
      {
        type: 'action',
        label: 'Schedule message',
        action: () => {}
      }
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button.cdk-menu-trigger')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[aria-label="Attach file"]')).toBeFalsy();
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
    const interruptButton = debugElement.query(By.css('button[aria-label="Stop processing"]'));
    expect(interruptButton).toBeTruthy();
    expect(interruptButton.query(By.css('[data-icon="elementStopFilled"]'))).toBeTruthy();
  });

  describe('follow-up prompts', () => {
    it('should not render follow-up prompts section when prompts are empty', async () => {
      followUpPrompts.set([]);
      await fixture.whenStable();

      const promptsContainer = debugElement.query(By.css('.follow-up-prompts'));
      expect(promptsContainer).toBeFalsy();
    });

    it('should render follow-up prompt buttons when prompts are provided', async () => {
      followUpPrompts.set(['Tell me more', 'Give an example']);
      await fixture.whenStable();

      const promptButtons = debugElement.queryAll(By.css('.follow-up-prompts button'));
      expect(promptButtons).toHaveLength(2);
      expect(promptButtons[0].nativeElement).toHaveTextContent('Tell me more');
      expect(promptButtons[1].nativeElement).toHaveTextContent('Give an example');
    });

    it('should emit followUpPromptSelected with the prompt text when a prompt is clicked', async () => {
      followUpPrompts.set(['Tell me more']);
      await fixture.whenStable();

      const promptButton = debugElement.query(By.css('.follow-up-prompts button'));
      promptButton.nativeElement.click();
      await fixture.whenStable();

      expect(followUpPromptSelectedSpy).toHaveBeenCalledWith('Tell me more');
    });

    it('should delegate updating the input value to the consumer', async () => {
      followUpPrompts.set(['Tell me more']);
      value.set('');
      await fixture.whenStable();

      const promptButton = debugElement.query(By.css('.follow-up-prompts button'));
      promptButton.nativeElement.click();
      await fixture.whenStable();

      expect(value()).toBe('');
    });

    it('should disable follow-up prompt buttons when disabled', async () => {
      followUpPrompts.set(['Tell me more']);
      disabled.set(true);
      await fixture.whenStable();

      const promptButton = debugElement.query(By.css('.follow-up-prompts button'));
      expect(promptButton.nativeElement).toBeDisabled();
    });

    it('should disable follow-up prompt buttons when sending', async () => {
      followUpPrompts.set(['Tell me more']);
      sending.set(true);
      await fixture.whenStable();

      const promptButton = debugElement.query(By.css('.follow-up-prompts button'));
      expect(promptButton.nativeElement).toBeDisabled();
    });

    it('should focus the textarea after selecting a follow-up prompt', async () => {
      followUpPrompts.set(['Tell me more']);
      await fixture.whenStable();

      const focusSpy = vi.spyOn(component, 'focus');
      const promptButton = debugElement.query(By.css('.follow-up-prompts button'));
      promptButton.nativeElement.click();
      await fixture.whenStable();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('voice input', () => {
    const button = (label: string): HTMLButtonElement =>
      fixture.nativeElement.querySelector(`button[aria-label="${label}"]`);
    const textarea = (): HTMLTextAreaElement => fixture.nativeElement.querySelector('textarea');

    beforeEach(() => {
      voiceInput.set(true);
    });

    it('should leave the standard input unchanged when voice input is not enabled', async () => {
      voiceInput.set(false);
      voiceState.set('recording');
      value.set('Typed message');
      await fixture.whenStable();

      expect(button('Start dictation')).toBeNull();
      expect(button('Cancel dictation')).toBeNull();
      expect(textarea()).toHaveProperty('readOnly', false);
      expect(button('Send')).toBeEnabled();
    });

    it('should request dictation without changing the consumer state or draft', async () => {
      value.set('Existing draft');
      await fixture.whenStable();

      button('Start dictation').click();
      await fixture.whenStable();

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(voiceState()).toBe('idle');
      expect(textarea().value).toBe('Existing draft');
      expect(button('Start dictation')).toBeEnabled();
    });

    it('should show listening feedback and a disabled send button before speech arrives', async () => {
      value.set('Existing draft');
      await fixture.whenStable();
      button('Start dictation').focus();
      voiceState.set('listening');
      await fixture.whenStable();

      expect(textarea()).toHaveAttribute('placeholder', 'Listening…');
      expect(textarea()).toHaveProperty('readOnly', true);
      expect(button('Cancel dictation')).toBeEnabled();
      expect(button('Send')).toBeDisabled();
      expect(button('Confirm dictation')).toBeNull();
      expect(fixture.nativeElement.querySelector('[role="status"]')).toHaveTextContent(
        'Listening…'
      );
      expect(button('Cancel dictation')).toHaveFocus();
    });

    it('should display streamed transcripts without moving focus on each update', async () => {
      voiceState.set('recording');
      await fixture.whenStable();
      button('Cancel dictation').focus();

      value.set('First partial transcript');
      await fixture.whenStable();
      value.set('First partial transcript with more words');
      await fixture.whenStable();

      expect(textarea().value).toBe('First partial transcript with more words');
      expect(button('Cancel dictation')).toHaveFocus();
    });

    it('should request confirmation without sending or clearing the transcript and attachments', async () => {
      const attachment: ChatInputAttachment = {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 7,
        type: 'text/plain'
      };
      value.set('Transcribed message');
      attachments.set([attachment]);
      await fixture.whenStable();
      textarea().focus();
      voiceState.set('recording');
      await fixture.whenStable();

      expect(button('Confirm dictation')).toHaveFocus();
      button('Confirm dictation').click();
      await fixture.whenStable();

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).not.toHaveBeenCalled();
      expect(value()).toBe('Transcribed message');
      expect(attachments()).toEqual([attachment]);
      expect(voiceState()).toBe('recording');
    });

    it.each(['listening', 'recording'] as const)(
      'should delegate cancellation in the %s state to the consumer',
      async state => {
        value.set('Partial transcript');
        voiceState.set(state);
        await fixture.whenStable();

        button('Cancel dictation').click();
        await fixture.whenStable();

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(value()).toBe('Partial transcript');
        expect(voiceState()).toBe(state);
        expect(sendSpy).not.toHaveBeenCalled();
      }
    );

    it('should confirm rather than send on Enter during recording', async () => {
      value.set('Partial transcript');
      voiceState.set('recording');
      await fixture.whenStable();

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should ignore held Enter after confirmation until a fresh key press', async () => {
      value.set('Transcript for review');
      await fixture.whenStable();
      textarea().focus();
      voiceState.set('recording');
      confirmSpy.mockImplementation(() => voiceState.set('idle'));
      await fixture.whenStable();

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();
      expect(textarea()).toHaveFocus();
      const repeated = new KeyboardEvent('keydown', {
        key: 'Enter',
        repeat: true,
        bubbles: true,
        cancelable: true
      });
      textarea().dispatchEvent(repeated);
      await fixture.whenStable();

      expect(repeated.defaultPrevented).toBe(true);
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).not.toHaveBeenCalled();
      expect(value()).toBe('Transcript for review');

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent repeated Enter from activating a native dictation button', async () => {
      voiceState.set('recording');
      await fixture.whenStable();
      const repeated = new KeyboardEvent('keydown', {
        key: 'Enter',
        repeat: true,
        bubbles: true,
        cancelable: true
      });

      button('Confirm dictation').dispatchEvent(repeated);

      expect(repeated.defaultPrevented).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('should use the recording icons and provisional text color until review', async () => {
      voiceState.set('recording');
      value.set('Provisional transcript');
      await fixture.whenStable();

      expect(button('Confirm dictation').querySelector('si-icon')).toHaveAttribute(
        'data-icon',
        'elementCheckedFilled'
      );
      expect(button('Cancel dictation').querySelector('si-icon')).toHaveAttribute(
        'data-icon',
        'elementStateClose'
      );
      expect(textarea()).toHaveClass('text-secondary');

      voiceState.set('idle');
      await fixture.whenStable();
      expect(textarea()).not.toHaveClass('text-secondary');
    });

    it('should preserve disabled text styling while recording', async () => {
      voiceState.set('recording');
      disabled.set(true);
      await fixture.whenStable();
      expect(textarea()).not.toHaveClass('text-secondary');
    });

    it('should preserve contextual action focus when recording starts and ends', async () => {
      allowAttachments.set(true);
      voiceState.set('listening');
      await fixture.whenStable();
      button('Attach file').focus();

      voiceState.set('recording');
      value.set('First partial transcript');
      await fixture.whenStable();
      expect(button('Attach file')).toHaveFocus();

      voiceState.set('idle');
      await fixture.whenStable();
      expect(button('Attach file')).toHaveFocus();
    });

    it('should move focus from cancel to confirm when speech begins', async () => {
      voiceState.set('listening');
      await fixture.whenStable();
      button('Cancel dictation').focus();

      voiceState.set('recording');
      await fixture.whenStable();

      expect(button('Confirm dictation')).toHaveFocus();
    });

    it('should preserve focus outside the component across dictation transitions', async () => {
      const externalButton = document.createElement('button');
      document.body.append(externalButton);
      try {
        voiceState.set('listening');
        await fixture.whenStable();
        externalButton.focus();

        voiceState.set('recording');
        await fixture.whenStable();
        expect(externalButton).toHaveFocus();

        voiceState.set('idle');
        await fixture.whenStable();
        expect(externalButton).toHaveFocus();
      } finally {
        externalButton.remove();
      }
    });

    it('should not confirm or send on Enter while waiting for speech', async () => {
      value.set('Existing draft');
      voiceState.set('listening');
      await fixture.whenStable();

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should cancel on Escape from a recording control', async () => {
      voiceState.set('recording');
      await fixture.whenStable();

      button('Confirm dictation').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );

      expect(cancelSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should not handle dictation shortcuts during IME composition', async () => {
      voiceState.set('recording');
      await fixture.whenStable();

      for (const key of ['Enter', 'Escape']) {
        textarea().dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true, isComposing: true })
        );
      }

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(cancelSpy).not.toHaveBeenCalled();
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should restore editing and place the cursor after the transcript when dictation ends', async () => {
      await fixture.whenStable();
      textarea().focus();
      voiceState.set('recording');
      value.set('Confirmed transcript');
      await fixture.whenStable();

      voiceState.set('idle');
      await fixture.whenStable();

      expect(textarea()).toHaveFocus();
      expect(textarea()).toMatchObject({
        readOnly: false,
        selectionStart: value().length,
        selectionEnd: value().length
      });
      expect(button('Start dictation')).toBeEnabled();
      expect(button('Send')).toBeEnabled();
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should send a confirmed transcript only after the user clicks send', async () => {
      voiceState.set('recording');
      value.set('Confirmed transcript');
      await fixture.whenStable();
      voiceState.set('idle');
      await fixture.whenStable();

      button('Send').click();
      await fixture.whenStable();

      expect(sendSpy).toHaveBeenCalledExactlyOnceWith({
        content: 'Confirmed transcript',
        attachments: []
      });
      expect(textarea().value).toBe('');
    });

    it('should keep attachment and custom actions available while recording', async () => {
      const actionSpy = vi.fn();
      actions.set([{ label: 'Take photo', icon: 'element-camera', action: actionSpy }]);
      allowAttachments.set(true);
      voiceState.set('recording');
      await fixture.whenStable();

      button('Take photo').click();

      expect(actionSpy).toHaveBeenCalledTimes(1);
      expect(button('Attach file')).toBeEnabled();
      expect(Array.from(fixture.nativeElement.querySelectorAll('button'))).toEqual([
        button('Attach file'),
        button('Take photo'),
        button('Cancel dictation'),
        button('Confirm dictation')
      ]);
    });

    it.each(['listening', 'recording'] as const)(
      'should prevent follow-up prompts from replacing the transcript while %s',
      async state => {
        followUpPrompts.set(['Replace the draft']);
        voiceState.set(state);
        value.set('Partial transcript');
        await fixture.whenStable();

        const prompt: HTMLButtonElement = fixture.nativeElement.querySelector(
          '.follow-up-prompts button'
        );
        expect(prompt).toBeDisabled();
        prompt.click();

        expect(followUpPromptSelectedSpy).not.toHaveBeenCalled();
        expect(value()).toBe('Partial transcript');
      }
    );

    it.each(['idle', 'listening', 'recording'] as const)(
      'should disable voice controls and shortcuts in the disabled %s state',
      async state => {
        voiceState.set(state);
        disabled.set(true);
        await fixture.whenStable();

        const buttons: HTMLButtonElement[] = Array.from(
          fixture.nativeElement.querySelectorAll('button')
        );
        for (const control of buttons) {
          expect(control).toBeDisabled();
          control.click();
        }
        for (const key of ['Enter', 'Escape']) {
          textarea().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        }

        expect(startSpy).not.toHaveBeenCalled();
        expect(confirmSpy).not.toHaveBeenCalled();
        expect(cancelSpy).not.toHaveBeenCalled();
      }
    );

    it('should prevent starting dictation while a response is being processed', async () => {
      sending.set(true);
      await fixture.whenStable();

      expect(button('Start dictation')).toBeDisabled();
      button('Start dictation').click();

      expect(startSpy).not.toHaveBeenCalled();
    });

    it('should not interrupt response generation when confirming dictation', async () => {
      interruptible.set(true);
      voiceState.set('recording');
      await fixture.whenStable();

      button('Confirm dictation').click();

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(interruptSpy).not.toHaveBeenCalled();
    });

    it('should support custom translated voice labels', async () => {
      voiceLabels.set({
        start: 'Start microphone',
        cancel: 'Discard transcript',
        confirm: 'Keep transcript',
        listening: 'Waiting for speech'
      });
      await fixture.whenStable();
      expect(button('Start microphone')).toBeEnabled();

      voiceState.set('listening');
      await fixture.whenStable();
      expect(button('Discard transcript')).toBeEnabled();
      expect(textarea()).toHaveAttribute('placeholder', 'Waiting for speech');

      voiceState.set('recording');
      await fixture.whenStable();
      expect(button('Keep transcript')).toBeEnabled();
    });
  });
});
