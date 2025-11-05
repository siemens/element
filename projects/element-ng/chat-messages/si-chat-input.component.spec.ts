/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FileUploadError, UploadFile } from '@siemens/element-ng/file-uploader';

import { MessageAction } from './message-action.model';
import {
  ChatInputAttachment,
  SiChatInputComponent as TestComponent
} from './si-chat-input.component';

describe('SiChatInputComponent', () => {
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

  it('should have default empty value', () => {
    fixture.detectChanges();
    expect(component.value()).toBe('');
  });

  it('should have default disabled state of false', () => {
    fixture.detectChanges();
    expect(component.disabled()).toBe(false);
  });

  it('should have default sending state of false', () => {
    fixture.detectChanges();
    expect(component.sending()).toBe(false);
  });

  it('should have default empty actions array', () => {
    fixture.detectChanges();
    expect(component.actions()).toEqual([]);
  });

  it('should have default empty secondary actions array', () => {
    fixture.detectChanges();
    expect(component.secondaryActions()).toEqual([]);
  });

  it('should have default empty attachments array', () => {
    fixture.detectChanges();
    expect(component.attachments()).toEqual([]);
  });

  it('should have default allowAttachments of false', () => {
    fixture.detectChanges();
    expect(component.allowAttachments()).toBe(false);
  });

  it('should have default interruptible state of false', () => {
    fixture.detectChanges();
    expect(component.interruptible()).toBe(false);
  });

  it('should have default maxFileSize of 10MB', () => {
    fixture.detectChanges();
    expect(component.maxFileSize()).toBe(10485760);
  });

  it('should render textarea input', () => {
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea).toBeTruthy();
  });

  it('should render send button', () => {
    fixture.detectChanges();

    const sendButton = debugElement.query(By.css('button'));
    expect(sendButton).toBeTruthy();
  });

  it('should disable send button when no content and no attachments', () => {
    fixture.componentRef.setInput('value', '');
    fixture.componentRef.setInput('attachments', []);
    fixture.detectChanges();

    expect((component as any).canSend()).toBe(false);
  });

  it('should enable send button when there is content', () => {
    component.value.set('Hello');
    fixture.detectChanges();

    expect((component as any).canSend()).toBe(true);
  });

  it('should enable send button when there are attachments', () => {
    const attachments: ChatInputAttachment[] = [
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];
    component.attachments.set(attachments);
    fixture.detectChanges();

    expect((component as any).canSend()).toBe(true);
  });

  it('should disable send button when disabled is true', () => {
    component.value.set('Hello');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect((component as any).canSend()).toBe(false);
  });

  it('should disable send button when sending is true', () => {
    component.value.set('Hello');
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    expect((component as any).canSend()).toBe(false);
  });

  it('should emit send event when send button is clicked', () => {
    let emittedData: any;
    component.send.subscribe((data: any) => {
      emittedData = data;
    });

    component.value.set('Test message');
    fixture.detectChanges();

    const sendButton = debugElement.query(By.css('button'));
    sendButton.nativeElement.click();

    expect(emittedData).toEqual({
      content: 'Test message',
      attachments: []
    });
  });

  it('should clear input after sending', () => {
    component.value.set('Test message');
    fixture.detectChanges();

    (component as any).onSend();

    expect(component.value()).toBe('');
  });

  it('should clear attachments after sending', () => {
    const attachments: ChatInputAttachment[] = [
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];
    component.attachments.set(attachments);
    fixture.detectChanges();

    (component as any).onSend();

    expect(component.attachments()).toEqual([]);
  });

  it('should send on Enter key press', () => {
    let emittedData: any;
    component.send.subscribe((data: any) => {
      emittedData = data;
    });

    component.value.set('Test message');
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    textarea.nativeElement.dispatchEvent(event);

    expect(emittedData).toBeDefined();
  });

  it('should not send on Shift+Enter key press', () => {
    let emittedCount = 0;
    component.send.subscribe(() => {
      emittedCount++;
    });

    component.value.set('Test message');
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    spyOn(event, 'preventDefault');
    textarea.nativeElement.dispatchEvent(event);

    expect(emittedCount).toBe(0);
  });

  it('should not send on Enter when interruptible is true', () => {
    let emittedCount = 0;
    component.send.subscribe(() => {
      emittedCount++;
    });

    component.value.set('Test message');
    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    spyOn(event, 'preventDefault');
    textarea.nativeElement.dispatchEvent(event);

    expect(emittedCount).toBe(0);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not render attachment list when no attachments', () => {
    fixture.componentRef.setInput('attachments', []);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeFalsy();
  });

  it('should render attachment list when attachments exist', () => {
    const attachments: ChatInputAttachment[] = [
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];
    component.attachments.set(attachments);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeTruthy();
  });

  it('should remove attachment when remove is triggered', () => {
    const attachments: ChatInputAttachment[] = [
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
    component.attachments.set(attachments);
    fixture.detectChanges();

    (component as any).removeAttachment(attachments[0]);

    expect(component.attachments().length).toBe(1);
    expect(component.attachments()[0].name).toBe('file2.txt');
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

    expect(component.attachments().length).toBe(1);
    expect(component.attachments()[0].name).toBe('test.txt');
    expect(component.attachments()[0].file).toBe(mockFile);
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

    expect(component.attachments().length).toBe(1);
    expect(component.attachments()[0].name).toBe('test1.txt');
  });

  it('should emit file error event', () => {
    let emittedError: FileUploadError | undefined;
    component.fileError.subscribe((error: FileUploadError) => {
      emittedError = error;
    });

    const mockError = {
      fileName: 'large.txt'
    } as FileUploadError;

    (component as any).onFileError(mockError);

    expect(emittedError).toEqual(mockError);
  });

  it('should use custom placeholder', () => {
    const customPlaceholder = 'Type your message here...';
    fixture.componentRef.setInput('placeholder', customPlaceholder);
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.placeholder).toBe(customPlaceholder);
  });

  it('should use custom send button label', () => {
    const customLabel = 'Submit';
    fixture.componentRef.setInput('sendButtonLabel', customLabel);
    fixture.detectChanges();

    const sendButton = debugElement.query(By.css('button'));
    expect(sendButton.nativeElement.getAttribute('aria-label')).toContain(customLabel);
  });

  it('should use custom send button icon', () => {
    const customIcon = 'element-check';
    fixture.componentRef.setInput('sendButtonIcon', customIcon);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('button si-icon'));
    expect(icon.componentInstance.icon()).toBe(customIcon);
  });

  it('should show stop icon when interruptible is true', () => {
    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('button si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-stop-filled');
  });

  it('should use interrupt button label when interruptible is true', () => {
    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-label')).toContain('Interrupt');
  });

  it('should emit interrupt event when interrupt button is clicked', () => {
    let interruptEmitted = false;
    component.interrupt.subscribe(() => {
      interruptEmitted = true;
    });

    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(interruptEmitted).toBe(true);
  });

  it('should disable interrupt button when sending is true', () => {
    fixture.componentRef.setInput('interruptible', true);
    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should disable interrupt button when disabled is true', () => {
    fixture.componentRef.setInput('interruptible', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should not clear input and attachments when interrupt is triggered', () => {
    const attachments: ChatInputAttachment[] = [
      {
        name: 'file.txt',
        file: new File(['content'], 'file.txt'),
        size: 100,
        type: 'text/plain'
      }
    ];

    component.value.set('Test message');
    component.attachments.set(attachments);
    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    (component as any).onButtonClick();

    expect(component.value()).toBe('Test message');
    expect(component.attachments()).toEqual(attachments);
  });

  it('should respect maxLength', () => {
    fixture.componentRef.setInput('maxLength', 10);
    fixture.detectChanges();

    const textarea = debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.maxLength).toBe(10);
  });

  it('should show disclaimer when provided', () => {
    const disclaimer = 'This is a disclaimer';
    fixture.componentRef.setInput('disclaimer', disclaimer);
    fixture.detectChanges();

    const disclaimerElement = debugElement.query(By.css('.si-caption'));
    expect(disclaimerElement).toBeTruthy();
    expect(disclaimerElement.nativeElement.textContent).toContain(disclaimer);
  });

  it('should render action buttons when actions are provided', () => {
    const actions: MessageAction[] = [
      {
        label: 'Attach',
        icon: 'element-attachment',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('[siChatMessageAction] button');
    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0].getAttribute('aria-label')).toBe('Attach');
  });

  it('should have focus method', () => {
    fixture.detectChanges();
    expect(typeof component.focus).toBe('function');
  });

  it('should use send mode when interruptible is false', () => {
    component.value.set('Test message');
    fixture.componentRef.setInput('interruptible', false);
    fixture.detectChanges();

    expect((component as any).showInterruptButton()).toBe(false);
    expect((component as any).buttonIcon()).toBe('element-send-filled');
    expect((component as any).buttonLabel()).toContain('Send');
  });

  it('should use interrupt mode when interruptible is true', () => {
    fixture.componentRef.setInput('interruptible', true);
    fixture.detectChanges();

    expect((component as any).showInterruptButton()).toBe(true);
    expect((component as any).buttonIcon()).toBe('element-stop-filled');
    expect((component as any).buttonLabel()).toContain('Interrupt');
  });
});
